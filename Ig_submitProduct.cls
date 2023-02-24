public class Ig_submitProduct {

    @AuraEnabled
    public static List<product__c> submitProduct(String submitData) {
        System.debug('submitData :: '+submitData);
        String result = '';
        List<Object> res = (List<Object>)JSON.deserializeUntyped(submitData);
        List<product__c> productList = new List<product__c>();
        try {
            for(Object obj : res) {
                product__c product = new product__c();
                Map<String, Object> map1 = (Map<String, Object>) obj;
                productList.add(insertProduct(map1));
            }
            System.debug('productList :: '+ productList);
            insert productList;
        } catch (Exception e) {
            System.debug('err :: ' + e.getMessage());
        }
        return productList;
    }

    @AuraEnabled
    public static product__c insertProduct(Map<String, Object> map1){
        product__c product = new product__c();
        try {
            product.brand__c = String.valueOf(map1.get('brand'));
            product.keyboardType__c = String.valueOf(map1.get('keyboardType'));
            product.Name = String.valueOf(map1.get('productName'));
            product.keyboardName__c = String.valueOf(map1.get('keyboardName'));
            product.productNum__c = Integer.valueOf(map1.get('productNum'));
            product.productPrice__c = Integer.valueOf(map1.get('productPrice'));
        } catch (Exception e) {
            System.debug('err :: '+ e.getMessage());
        }
        return product;
    }
}