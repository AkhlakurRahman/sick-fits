const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO check if user is logged in

    const item = await ctx.db.mutation.createItem(
      {
        data: {
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
    const item = await ctx.db.query.item({ where }, `{id, title}`);

    //Check for permission to delete

    // Delete the item
    return ctx.db.mutation.deleteItem({ where }, info);
  }
};

module.exports = Mutations;
