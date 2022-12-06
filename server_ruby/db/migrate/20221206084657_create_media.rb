class CreateMedia < ActiveRecord::Migration[6.1]
  def change
    create_table :media do |t|
      t.references :employee, null: true, foreign_key: true
      t.string :file_name, null: false, limit: 40
      t.string :file_type, null: false, limit: 20
      t.decimal :file_size, scale: 2, precision: 20, null: false
      t.string :category, null: false, default: "", limit: 50
      t.binary :file_data, limit: 100.megabytes
      t.timestamps null: false
    end
  end
end
