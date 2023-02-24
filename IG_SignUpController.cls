public without sharing class IG_SignUpController {
    
    @AuraEnabled
    public static String signUp(Map<String, String> dataGroup) {
        System.debug('dataStrGroup ::: ' + dataGroup);
        String result = IG_SignUpService.doSignUp(dataGroup);
        return result;
    }

    @AuraEnabled
    public static Boolean validUserNickName(String nickName){
        System.debug('nickName ::: ' + nickName);
        List<User> userList = [SELECT Id FROM User WHERE Alias = :nickName];
        if (userList.size() > 0) return true;
        else return false;
    }
}