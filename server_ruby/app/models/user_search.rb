class UserSearch
    include ActiveModel::Model
    attr_accessor :operator, *User.allowed_columns

    def persisted?
        false
    end
end

