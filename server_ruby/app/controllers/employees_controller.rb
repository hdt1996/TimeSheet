class EmployeesController < ApplicationController
    def new
        @user = User.find(params[:user_id])
        if params[:errors]
            params[:errors].each do |error|
                @user.errors.add(error,"")
            end
        end
    end

    def show
        @employee = Employee.find(params[:employee_id])
        @photo = @employee.medium.where(category: "photo")
        @onboard_docs = @employee.medium.where(category: "onboard_docs")
    end

    def create
        user = User.find(params[:user_id])
        employee = user.build_employee(employee_params)
        employee.medium.build(file: medium_params, :category => "photo", :is_public => false)
        unless employee.save
            alert = "Failed: Could not register employee for #{user.username}"
            #redirect_back fallback_location: new_employee_path("test": 5), alert: notice. ==> Gives us params for user_id and employee_id without passing as arg.
            # However, on this conditional, employee_id is not valid since saving did not happen
            redirect_to new_employee_path("user_id": user, "errors": employee.errors.full_messages), alert: notice and return #Works to pass in extra params
        end
        #employee.destroy
        notice = "Success: #{user.username} is now an employee"
        redirect_to admin_index_path, notice: notice
        
    end

    private
    def employee_params
        emp_params = params.require(:employee).permit(:email, :hourly, :department, :pay_rate)
    end

    def medium_params
        file_params = params.require(:employee).permit(:photo)
        file_params[:file] = file_params.delete :photo
    end
    
end
