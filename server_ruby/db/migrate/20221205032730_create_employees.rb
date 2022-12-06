class CreateEmployees < ActiveRecord::Migration[6.1]
  def change
    create_table :employees do |t|
      t.references :user, null: false, foreign_key: true
      t.string :email,              null: false, default: ""
      t.boolean :hourly, null: false, default: true
      t.string :department, null: false, default: ""
      t.decimal :pay_rate, scale: 2, precision: 20, null: false
      t.binary :photo, :limit=> 50.megabytes
      t.binary :'onboard_docs', :limit=> 200.megabytes
      t.timestamps null: false
    end
  end
end
