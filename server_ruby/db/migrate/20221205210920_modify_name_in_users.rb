class ModifyNameInUsers < ActiveRecord::Migration[6.1]
  def change
    change_column :users, :first_name, :string, limit: 20
    change_column :users, :last_name, :string, limit: 20
    change_column :users, :middle_name, :string, limit: 20
  end
end
