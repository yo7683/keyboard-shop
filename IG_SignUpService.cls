public without sharing class IG_SignUpService {

    @AuraEnabled(cacheable=false)
    public static String doSignUp(Map<String, String> dataGroup){
        String result = '';
        Boolean overlapCheck = userOverlapCheck(dataGroup.get('email'));
        if(overlapCheck) return 'overlap';

        String j = JSON.serialize(dataGroup);
        
        Savepoint sp = Database.setSavepoint();
        try {
            Account acc = createAccount(dataGroup);
            Contact con = createContact(dataGroup, acc);
            createUser(j , con.Id, acc.Id);
            System.debug('j ::: ' + j);
            result = 'success';
        } catch (Exception e) {
            Database.rollback(sp);
            System.debug('server error ::: ' + e.getMessage());
            result = 'error';
        }
        return result;
    }

    private static Boolean userOverlapCheck(String userEmail) {
        List<User> userList = [SELECT ID,NAME, USERNAME FROM USER  WHERE UserName = :userEmail];
        if(userList.size() > 0) return true;
        else return false;
    }

    private static Account createAccount(Map<String, String> dataGroup) {
        Account acc = new Account();
        acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('KeyboardShop').getRecordTypeId();
        acc.Name = dataGroup.get('name');
        acc.Phone = dataGroup.get('phone');
        insert acc;
        return acc;
    }


    private static Contact createContact(Map<String, String> dataGroup, Account acc) {
        Contact con = new Contact();
        con.AccountId = acc.Id;
        con.LastName = dataGroup.get('name');
        con.Phone = dataGroup.get('phone');
        con.Email = dataGroup.get('email');
        insert con;
        
        return con;
    }

    @future
    private static void createUser(String j, String conId, String accId) {
        Map<String, Object> map1 = (Map<String, Object>)JSON.deserializeUntyped(j);
        Profile profile = [SELECT Id FROM Profile WHERE Name = 'Keyboard Shop User'];
        System.debug('profile ::: ' + profile);
        
        User user = new User();
        user.Username = string.valueOf(map1.get('email'));
        user.ContactId = conId;
        user.Phone = string.valueOf(map1.get('phone'));
        user.ProfileId = profile.Id;
        user.Alias = string.valueOf(map1.get('nickName'));
        user.Email = string.valueOf(map1.get('email'));
        user.EmailEncodingKey = 'UTF-8';
        user.LastName = string.valueOf(map1.get('name'));
        user.CMS__c = '고객';
        user.CommunityNickname = string.valueOf(map1.get('nickName'));
        user.TimeZoneSidKey = 'Asia/Seoul';
        user.LocaleSidKey = 'ko_KR';
        user.LanguageLocaleKey = 'ko';
        user.IsActive = true;
        try {
            // String createUser = Site.createExternalUser(user, accId, string.valueOf(map1.get('password')));
            insert user;
            // System.setPassword(user.Id, string.valueOf(map1.get('password')));
        } catch (Exception e) {
            System.debug('user insert exception ::: ' + e.getMessage());
        }
    }
}