const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');

const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');
const stripe = require('../stripe');

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO check if user is logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to create an item.');
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          // ! Relationship between item and user
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
          ...args
        }
      },
      info
    );

    return item;
  },

  updateItem(parent, args, ctx, info) {
    // Copy of the updates
    const updates = { ...args };
    // Remove the id
    delete updates.id;

    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };

    // Find the item
    const item = await ctx.db.query.item({ where }, `{id title user {id}}`);

    //Check for permission to delete
    const owner = item.user.id === ctx.request.userId;
    const hasPermission = ctx.request.user.permissions.some(permission =>
      ['ADMIN', 'ITEMDELETE'].includes(permission)
    );

    if ((!owner && !hasPermission) || (owner && !hasPermission)) {
      throw new Error("You don't have the permission!!!!!");
    }

    // Delete the item
    return ctx.db.mutation.deleteItem({ where }, info);
  },

  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    const password = await bcrypt.hash(args.password, 12);
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER', 'ADMIN'] }
        }
      },
      info
    );
    // Create JWT token for user
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // Setting JWT as cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
    });

    return user;
  },

  async signin(parent, { email, password }, ctx, info) {
    // Check user with the email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No user found with email: ${email}`);
    }

    // Check if the password match
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Invalid password');
    }

    // Create JWT token for user
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // Setting JWT as cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
    });

    // Return the user
    return user;
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'You are out!' };
  },

  async resetRequest(parent, { email }, ctx, info) {
    // Check if the user exists
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No user found with email: ${email}`);
    }

    // Set a reset token and expiry time
    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 600000; // 10 minutes from now

    await ctx.db.mutation.updateUser({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Mail user with resetToken
    await transport.sendMail({
      from: 'sick@fits.com',
      to: user.email,
      subject: 'Your password reset token',
      html: makeANiceEmail(
        `Go to link below to reset your password. After 10 minutes the link will be inactive
        \n\n
        <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">
          Click Here to Set Your New Password
        </a>`
      )
    });

    // Return message
    return { message: 'WOW' };
  },

  async resetPassword(
    parent,
    { resetToken, password, confirmPassword },
    ctx,
    info
  ) {
    // check if the passwords match
    if (password !== confirmPassword) {
      throw new Error("Your passwords don't match!");
    }

    // Verify the resetToken and expiry time
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: resetToken,
        resetTokenExpiry_gte: Date.now() - 600000
      }
    });
    if (!user) {
      throw new Error('This token is either invalid or expired!');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save new user
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    // Generate JWT token
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);

    // Set cookies
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
    });

    // Return updated user
    return updatedUser;
  },

  async updatePermissions(parent, args, ctx, info) {
    // check if user logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in.');
    }

    // Query current user
    const currentUser = await ctx.db.query.user(
      { where: { id: ctx.request.userId } },
      info
    );

    // Check user has permission
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);

    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions
          }
        },
        where: { id: args.userId }
      },
      info
    );
  },

  async addToCart(parent, args, ctx, info) {
    // Check to see if user logged in
    const userId = ctx.request.userId;
    if (!userId) {
      throw new Error('You must signed in.');
    }

    // Query users current cart
    const [existingCart] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id }
      }
    });

    // If item is already in the cart increment by 1
    if (existingCart) {
      console.log('Your item already there');
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCart.id },
          data: { quantity: existingCart.quantity + 1 }
        },
        info
      );
    }

    // If not add new item
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId }
          },
          item: {
            connect: { id: args.id }
          }
        }
      },
      info
    );
  },

  async removeFromCart(parent, args, ctx, info) {
    // Find the cart item
    const cartItem = await ctx.db.query.cartItem(
      { where: { id: args.id } },
      `{id, user {id}}`
    );

    // If not any cart item found
    if (!cartItem) throw new Error('No cart item found');

    // Make sure user own the cart item
    if (ctx.request.userId !== cartItem.user.id) {
      throw new Error('Permission denied');
    }
    // Delete cart item
    return ctx.db.mutation.deleteCartItem({ where: { id: args.id } }, info);
  },

  async createOrder(parent, args, ctx, info) {
    // 1. Query the current user and make sure they are signed in
    const { userId } = ctx.request;
    if (!userId)
      throw new Error('You must be signed in to complete this order.');
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{
      id
      name
      email
      cart {
        id
        quantity
        item { title price id description image largeImage }
      }}`
    );
    // 2. recalculate the total for the price
    const amount = user.cart.reduce(
      (tally, cartItem) => tally + cartItem.item.price * cartItem.quantity,
      0
    );
    console.log(`Going to charge for a total of ${amount}`);
    // 3. Create the stripe charge (turn token into $$$)
    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token
    });
    // 4. Convert the CartItems to OrderItems
    const orderItems = user.cart.map(cartItem => {
      orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } }
      };
      delete orderItem.id;
      return orderItem;
    });
    // 5. create the Order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId } }
      }
    });
    // 6. Clean up - clear the users cart, delete cartItems
    const cartItemIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds
      }
    });
    // 7. Return the Order to the client
    return order;
  }
};

module.exports = Mutations;
