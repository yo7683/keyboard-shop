public class IG_HomeController {
    

    @AuraEnabled
    public static String getUserRank(String userId) {
        User user = [SELECT CMS__c FROM User WHERE Id = :userId LIMIT 1];
        /* String rank = uList.get(0).CMS__c; */
        return user.CMS__c;
    }
}