public class IG_MyPageController {
    
    @AuraEnabled
    public static Map<String, Object> getProPurchsedByCustomer(String userId) {
        List<Payment_Information__c> itemList = [SELECT
                                                    Id,
                                                    Name,
                                                    PurchasePrice__c,
                                                    PurchaseCount__c,
                                                    productPurchase__r.Name,
                                                    reviewStatus__c, 
                                                    CreatedDate
                                                FROM Payment_Information__c
                                                WHERE buyer__c = :userId];
        Set<Id> itemIds = new Set<Id>();
        for(Integer i = 0; i < itemList.size(); i++) {
            itemIds.add(itemList.get(i).productPurchase__c);
        }

        List<ContentDistribution> cdbList = [SELECT
                                                ContentDownloadUrl,
                                                RelatedRecordId
                                            FROM ContentDistribution
                                            WHERE RelatedRecordId IN :itemIds];
        
        Map<String, Object> resultMap = new Map<String, Object>();
        resultMap.put('itemList', itemList);
        resultMap.put('imageList', cdbList);

        return resultMap;
    }

    @AuraEnabled
    public static List<Shopping_Basket__c> getBasketList() {
        String userId = UserInfo.getUserId();
        List<Shopping_Basket__c> basket = [SELECT Id, product__c, product__r.keyboardName__c, productPrice__c, productNum__c FROM Shopping_Basket__c WHERE OwnerId =: userId ORDER BY insertTime__c DESC];
        return basket;
    }

    @AuraEnabled
    public static List<Product__c> getProductList(String recordId) {
        List<Product__c> pList = [SELECT Id, keyboardName__c, brand__c, productNum__c, productPrice__c FROM Product__c WHERE Id =: recordId];
        return pList;
    }
    
    @AuraEnabled
    public static String deleteBasket(String recordId) {
        String status = '';

        List<Shopping_Basket__c> sb = [SELECT Id FROM Shopping_Basket__c WHERE product__c =: recordId];
        try {
            delete sb;
            status = 'success';
        } catch(Exception e) {
            status = e.getMessage() + ' || ' + e.getLineNumber();
        }
        return status;
    }

    @AuraEnabled
    public static String deleteBasketAll() {
        String status = '';

        List<Shopping_Basket__c> sb = [SELECT Id FROM Shopping_Basket__c];
        try {
            delete sb;
            status = 'success';
        } catch(Exception e) {
            status = e.getMessage() + ' || ' + e.getLineNumber();
        }
        return status;
    }
}