class Query::Users < Query::Base
    attr_accessor :employee_id, :num_customs, *User.allowed_columns
    @@FIELD_MAP = 
    {
      :id =>  {:field => :number_field, :class => "query-field-sh", :validator => :integer, :opts => {:step => 1}},
      :email =>  {:field => :email_field, :class => "query-field-lg", :validator => :text, :opts => {}},
      :created_at =>  {:field => :date_field, :class => "query-field-sh", :validator => :date, :opts => {}},
      :updated_at =>  {:field => :date_field, :class => "query-field-sh", :validator => :date, :opts => {}},
      :username =>  {:field => :text_field, :class => "query-field-lg", :validator => :text, :opts => {}},
      :role =>  {:field => :text_field, :class => "query-field-sh", :validator => :integer, :opts => {}},
      :first_name =>  {:field => :text_field, :class => "query-field-md", :validator => :text, :opts => {}},
      :last_name =>  {:field => :text_field, :class => "query-field-md", :validator => :text, :opts => {}},
      :middle_name =>  {:field => :text_field, :class => "query-field-md", :validator => :text, :opts => {}},
      :employee_id =>  {:field => :number_field, :class => "query-field-sh", :validator => :integer, :opts => {}}
    }

    def self.FIELD_MAP
        @@FIELD_MAP
    end

    def persisted?
        false
    end

    def initialize(*arg)
        super
        @num_customs = [num_customs.to_i ,@@MAX_CUSTOMS].min
    
    end
end

