class AddPublicToMedium < ActiveRecord::Migration[6.1]
  def change
    add_column :media, :public?, :boolean, default: true
  end
end
