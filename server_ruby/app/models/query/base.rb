class Query::Base
  include ActiveModel::Model
  @@MAX_CUSTOMS = 10
  @@OPERATORS = 
  {
    :equal =>  '=',
    :not_equal => '!=',
    :greater => '>', 
    :less => '<',
    :greater_or_equal => '>=', 
    :less_or_equal => '<=', 
    :in => ':', 
    :starts_with => '^', 
    :ends_with => '$', 
    :contains => 'ctn',
    :empty => '='
  }

  def self.OPERATORS
    @@OPERATORS
  end

  def self.MAX_CUSTOMS
    @@MAX_CUSTOMS
  end
end