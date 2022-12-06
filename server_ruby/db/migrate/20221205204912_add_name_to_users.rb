class AddNameToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :first_name, :string
    add_column :users, :last_name, :string
    add_column :users, :middle_name, :string
    change_column :users, :username, :string, limit: 30
    change_column :users, :email, :string, limit: 50
  end
end
