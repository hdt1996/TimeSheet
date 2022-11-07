export default class Fetcher
{
    static domain = "http://192.168.1.17:8005";//"http://server-django-dev.us-west-2.elasticbeanstalk.com";
    static logInAPI = "/user/login/";
    static createLogin = "/user/create/";
    static checkAuthAPI='/user/authenticated/';
    static logOutAPI = '/user/logout/';
    static getCSRF = '/user/getCSRF/';
}