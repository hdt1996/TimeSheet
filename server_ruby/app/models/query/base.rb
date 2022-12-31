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
    :in => 'IN', 
    :starts_with => '^', 
    :ends_with => '$', 
    :contains => 'ctn',
    :empty => '='
  }

  @@OPERATOR_VALIDATION=
  {
    :in => 
    {
      :number_field => '^(\d+\,)+\d+$',
      :text_field => '^(([^\\\,\"]|(\\\")|(\\\,)|(\\\\))+\,)+([^\\\,\"]|(\\\")|(\\\,)|(\\\\))+$'
    }
  }

  def self.OPERATORS
    @@OPERATORS
  end

  def self.MAX_CUSTOMS
    @@MAX_CUSTOMS
  end

  def self.OPERATOR_VALIDATION
    @@OPERATOR_VALIDATION
  end
end