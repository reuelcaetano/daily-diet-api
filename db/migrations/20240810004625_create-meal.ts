import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.uuid('user_id')
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.boolean('diet').notNullable()
    table.uuid('session_id').notNullable()
    table.timestamp('registred_at').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}

