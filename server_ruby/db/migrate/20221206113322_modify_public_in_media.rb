class ModifyPublicInMedia < ActiveRecord::Migration[6.1]
  def change
    rename_column  :media, :public?, :is_public
  end
end
