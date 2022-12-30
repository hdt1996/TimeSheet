class Query::Users < Query::Base
    attr_accessor :employee_id, :num_customs, *User.allowed_columns
    @@FIELD_MAP = 
    {
      :id =>  {:field => :number_field, :class => "query-field-sh", :opts => {:step => 1}},
      :email =>  {:field => :email_field, :class => "query-field-lg", :opts => {}},
      :created_at =>  {:field => :date_field, :class => "query-field-sh", :opts => {}},
      :updated_at =>  {:field => :date_field, :class => "query-field-sh", :opts => {}},
      :username =>  {:field => :text_field, :class => "query-field-lg", :opts => {}},
      :role =>  {:field => :text_field, :class => "query-field-sh", :opts => {}},
      :first_name =>  {:field => :text_field, :class => "query-field-md", :opts => {}},
      :last_name =>  {:field => :text_field, :class => "query-field-md", :opts => {}},
      :middle_name =>  {:field => :text_field, :class => "query-field-md", :opts => {}},
      :employee_id =>  {:field => :number_field, :class => "query-field-sh", :opts => {}}
    }

    def self.FIELD_MAP
        @@FIELD_MAP
    end

    def persisted?
        false
    end

    def initialize(*arg)
        super
        @num_customs = [num_customs.to_i,@@MAX_CUSTOMS].min
    
    end
end

