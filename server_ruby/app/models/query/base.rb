require 'json'
module Query::Validator
  cattr_reader :SINGLE, :MULTIPLE, :STD_ERRORS
  @@SINGLE=
  {
    :integer => '^\d+$',
    :text => '^.*$',    
    :currency_loose => '^\$([^\W]|(\d+)(\.\d{2})?)$',
    :currency_strict => '^\$([^\W\d]|([1-9][0-9]{0,2}(\,\d{3})*)(\.\d{2})?)$',
    :decimal_strict => '^([^\W\d]|([1-9][0-9]{0,2}(\,\d{3})*)(\.\d+)?)$',
    :decimal_loose => '^(\d+(\.\d+)?)$',
    :date => '.*'
  }

  @@MULTIPLE = 
  {
    :integer => '^(\d+\,)+\d+$',
    :text => '^(\"([^\\\\\,\"]|(\\\\\")|(\\\\\,)|(\\\\\\\\))+\"\,)+\"([^\\\\\,\"]|(\\\\\")|(\\\\\,)|(\\\\\\\\))+\"$'
    #'^(\"([^\\\,\"]|(\\\")|(\\\,)|(\\\\))+\"\,)+\"([^\\\,\"]|(\\\")|(\\\,)|(\\\\))+\"$' regex101 build. Need to double escape backslash for ruby
  }

  @@STD_ERRORS = 
  {
    :integer => "List should consist of only integers",
    :text => "Each item in list should be enclosed by \( \" \) . If you need literal \( \" \) or \( \\ \) in your search, escape with \( \\ \)",
    :currency_loose => "",
    :currency_strict => "",
    :decimal_strict => "",
    :decimal_loose => "",
    :date => ''
  }

end

class Query::Base
  cattr_reader :VALIDATOR, :VALIDATION, :QUERY_MAP, :MAX_CUSTOMS, :VALUE_FORMAT_MAP, :NUM_TO_TEXT_MAP
  include ActiveModel::Model
  @@VALIDATOR = Query::Validator
  @@MAX_CUSTOMS = 10
  @@VALUE_FORMAT_MAP =
  {
    :standard => '?',
    :in => '(?)',
  }

  @@NUM_TO_TEXT_MAP= 
  {
    nil => {},
    false => {},
    true => 
    {
      :integer => '::text', 
      :currency_loose => '::text',
      :currency_strict => '::text',
      :decimal_strict => '::text',
      :decimal_loose => '::text'
    }
  }
  @@QUERY_MAP = 
  {
    :equal =>  {:symbol => '=', :validate => :standard, :format => :standard},
    :not_equal => {:symbol => '!=', :validate => :standard, :format => :standard},
    :greater => {:symbol => '>', :validate => :standard, :format => :standard}, 
    :less => {:symbol => '<', :validate => :standard, :format => :standard},
    :greater_or_equal => {:symbol => '>=', :validate => :standard, :format => :standard}, 
    :less_or_equal => {:symbol => '<=', :validate => :standard, :format => :standard}, 
    :in => {:symbol => :IN, :validate => :in, :format => :in}, 
    :starts_with => {:symbol => :LIKE, :validate => :starts_with, :format => :standard, :to_text => true}, 
    :ends_with => {:symbol => :LIKE, :validate => :ends_with, :format => :standard, :to_text => true}, 
    :contains => {:symbol => :LIKE, :validate => :contains, :format => :standard, :to_text => true},
    :empty => {:symbol => '=', :validate => :empty, :format => :standard}
  }
  
  def self.format_field(field, to_text)
    @@NUM_TO_TEXT_MAP[to_text][field]
  end

  def self.standard(f_type, value)
    value.match?(@@VALIDATOR.SINGLE[f_type])? value : false
  end

  def self.in(f_type, value)
    value.match?(@@VALIDATOR.MULTIPLE[f_type]) ? JSON.parse("[#{value}]") : false
  end

  def self.starts_with(f_type, value)
    "#{value}%"
  end

  def self.ends_with(f_type, value)
    "%#{value}"
  end

  def self.contains(f_type, value)
    "%#{value}%"
  end

  def self.empty(f_type, value)
    ""
  end

end