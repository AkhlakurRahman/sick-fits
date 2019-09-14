const { hasPermission } = require('../utils');

const { forwardTo } = require('prisma-binding');

const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, ctx, info) {
    // * Check if there is a current user ID
    if (!ctx.request.userId) {
      return null;
    }

    return ctx.db.query.user({ where: { id: ctx.request.userId } }, info);
  },
  async users(parent, args, ctx, info) {
    // Check if user is logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in.');
    }

    // Check user has permission to query for all users
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);

    // If user has enough permission the query users
    return ctx.db.query.users({}, info);
  },

  async order(parent, args, ctx, info) {
    // check if user is logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!');
    }

    // Query current order
    const order = await ctx.db.query.order(
      {
        where: { id: args.id }
      },
      info
    );

    // Check if user has permission
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes(
      'ADMIN'
    );

    if (!ownsOrder || !hasPermissionToSeeOrder) {
      throw new Error("You don' have the permission to see");
    }

    // Return order
    return order;
  },

  async orders(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error('You must be logged in');
    }

    return await ctx.db.query.orders(
      {
        where: { user: { id: userId } }
      },
      info
    );
  }
};

module.exports = Query;
