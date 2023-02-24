public with sharing class IG_UserLoginController {
    

    @AuraEnabled
    public static string userLogin(String id, String pwd, String startUrl){
        try {
            // id += '_ig.dev';
            System.debug(id + '     ' + pwd + '       ' + startUrl);
            ApexPages.PageReference pageRef = Site.login(id, pwd, startUrl);
            System.debug('pageRef ::: ' + pageRef);
            if(pageRef != null) return pageRef.getUrl();
            return '';
        } catch (Exception e) {
            System.debug('e.getMessage() :::  ' + e.getMessage());
            return null;
        }        
    }
}