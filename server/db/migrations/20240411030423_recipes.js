export async function up(knex) {
  await knex.schema.createTable('recipes', (table) => {
    table.increments('id').primary()
    table.string('name')
    table.string('image')
    table.string('ingredients')
    table.string('url')
  })
}

export async function down(knex) {
  await knex.schema.dropTable('recipes')
}
