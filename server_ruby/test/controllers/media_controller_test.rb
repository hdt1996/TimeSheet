require "test_helper"

class MediaControllerTest < ActionDispatch::IntegrationTest
  test "should get serve" do
    get media_serve_url
    assert_response :success
  end
end
