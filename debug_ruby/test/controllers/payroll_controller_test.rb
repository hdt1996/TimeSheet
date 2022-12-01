require "test_helper"

class PayrollControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get payroll_index_url
    assert_response :success
  end
end
