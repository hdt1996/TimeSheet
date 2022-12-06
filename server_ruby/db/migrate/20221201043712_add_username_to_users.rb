class AddUsernameToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :username, :string
    add_index :users, :username, unique: true
  end
end
#    add_column :users, :username, :string, unique: true, index: true