public without sharing class IG_PaymentController {
    @AuraEnabled
    public static Payment_Information__c insertProduct(String productId, Integer purchasePrice, Integer count) {
        Payment_Information__c pi = new Payment_Information__c();

        pi.productPurchase__c = productId;
        pi.PurchaseDate__c = Date.today();
        pi.purchasePrice__c = purchasePrice;
        pi.PurchaseCount__c = count;
        pi.buyer__c = UserInfo.getUserId();

        insert pi;
        return pi;
    }

    @AuraEnabled
    public static Shopping_Basket__c insertBasket(String productName, String recordId, Integer count, Integer purchasePrice) {

        Shopping_Basket__c sb = new Shopping_Basket__c();

        sb.Name = productName;
        sb.product__c = recordId;
        sb.productNum__c = count;
        sb.productPrice__c = purchasePrice;
        sb.OwnerId = UserInfo.getUserId();
        sb.insertTime__c = DateTime.now();

        insert sb;
        return sb;
    }

    @AuraEnabled
    public static List<User> getUser() {
        String userId = UserInfo.getUserId();
        List<User> user = [SELECT Id, Username, LastName, Phone FROM User WHERE Id =: userId];
        return user;
    }

    @AuraEnabled
    public static String createPayment() {
        String name = '';
        Payment_Information__c pi = new Payment_Information__c();
        try {
            insert pi;
            Payment_Information__c pList = [SELECT Id, Name FROM Payment_Information__c WHERE Id =: pi.Id];
            name = pList.Name;
        } catch(Exception e) {
            name = e.getMessage() + ' || ' + e.getLineNumber();
        }
        return name;
    }
}