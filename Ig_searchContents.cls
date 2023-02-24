public without sharing class Ig_searchContents {
    
    @AuraEnabled
    public static Map<String,Object> getProductList(Integer num, String searchValue, String filter, String brand, String keyboardType) {
        System.debug('searchValue :: ' + searchValue);
        System.debug('filter :: ' + filter);
        System.debug('brand :: ' + brand);
        System.debug('keyboardType :: ' + keyboardType);

        List<Product__c> productList;

        string searchKeyWord = '\'%' + searchValue + '%\'';
        String query = 'SELECT Id, brand__c, keyboardType__c, Name, keyboardName__c, productPrice__c, productInfo__c FROM Product__c';
        if(brand != '선택 안함' || keyboardType != '선택 안함' || searchValue != null) query += ' WHERE ';

        if(brand != '선택 안함') query += ' brand__c = : brand ';
        if(keyboardType != '선택 안함') {
            if(brand != '선택 안함') query += ' AND ';
            query += ' keyboardType__c = : keyboardType ';
        }
        if(searchValue != null) {
            if((brand != '선택 안함') || (keyboardType != '선택 안함')) query += ' AND ';  
            query += ' Name LIKE \'%' + searchValue + '%\'';
        }
        if(filter != '기본 순') {
            if(filter == '가격 높은 순') query += ' ORDER BY productPrice__c DESC ';
            else if(filter == '가격 낮은 순') query += ' ORDER BY productPrice__c ASC ';
        }
        System.debug('query ::: ' + query);

        productList = Database.query(query);
        System.debug('productlist :: '+productList);

        Integer allList = productList.size();

        List<Product__c> returnList = new List<Product__c>();

        if(allList > 0) {
            for(Integer i = 0; i < 10; i++) {
                Integer n = 10*(num-1);
                if(allList > n + i) {
                    returnList.add(productList[n+i]);
                }
            }
        }

        Map<String,Object> returnMap = new Map<String,Object>();
        returnMap.put('allList',allList);
        returnMap.put('returnList',returnList);
        System.debug('returnList :: ' + returnList);
        System.debug('returnMap :: ' + returnMap);

        return returnMap;
    }

    @AuraEnabled(cacheable = true)
    public static List<ContentDistribution> getImageList(String recordId){

        List<ContentDistribution> ImageList = [SELECT Id, ContentDownloadUrl, ContentVersionId, ContentDocumentId, RelatedRecordId FROM ContentDistribution WHERE RelatedRecordId =: recordId limit 1];
        
        System.debug('ImageList'+ImageList);
        return ImageList;
    }

    @AuraEnabled
    public static List<Product__c> getProduct(String recordId){
        List<Product__c> productList = [SELECT Id, brand__c, keyboardType__c, Name, keyboardName__c, productPrice__c, productInfo__c, productNum__c FROM Product__c WHERE Id =: recordId limit 1];
        return productList;
    }

    @AuraEnabled
    public static Product_Review_Board__c insertReview(String recordId, String review, Integer grade) {
        Product_Review_Board__c prb = new Product_Review_Board__c();
        prb.product__c = recordId;
        prb.content__c = review;
        prb.grade__c = grade;
        insert prb;
        return prb;
    }

    @AuraEnabled
    public static Map<String,Object> getReview(Integer num, String recordId, String filter) {
        List<Product_Review_Board__c> prb;
        String query = 'SELECT Id, content__c, product__c, grade__c FROM Product_Review_Board__c WHERE product__c =: recordId';
        if(filter == '최신 순') query += ' ORDER BY CreatedDate DESC';
        else if(filter == '오래된 순') query += ' ORDER BY CreatedDate ASC';
        else if(filter == '평점 높은 순') query += ' ORDER BY grade__c DESC';
        else query += ' ORDER BY grade__c ASC';
        
        prb = Database.query(query);

        Integer allList = prb.size();

        List<Product_Review_Board__c> returnList = new List<Product_Review_Board__c>();

        if(allList > 0) {
            for(Integer i = 0; i < 10; i++) {
                Integer n = 10*(num-1);
                if(allList > n + i) {
                    returnList.add(prb[n+i]);
                }
            }
        }

        Map<String,Object> returnMap = new Map<String,Object>();
        returnMap.put('allList',allList);
        returnMap.put('returnList',returnList);
        System.debug('allList :: '+allList);
        System.debug('returnList :: '+returnList);
        return returnMap;
    }

    @AuraEnabled
    public static Map<String,Object> getGrade(String recordId){
        List<Product_Review_Board__c> gradeList = [SELECT Id, content__c, product__c, grade__c FROM Product_Review_Board__c WHERE product__c =: recordId];
        Integer allGrade = gradeList.size();
        Decimal gradeSum = 0;
        Decimal grade = 0;

        if(allGrade > 0) {
            for(Integer i = 0; i < allGrade; i++) {
                System.debug('gradeList[i].grade__c :: ' + gradeList[i].grade__c);
                if(gradeList[i].grade__c > 0) gradeSum += gradeList[i].grade__c;
            }
            grade = gradeSum / allGrade;
        } else {
            grade = 0;
            allGrade = 0;
        }
        grade = Math.round(grade * 10) / 10.0;

        Map<String,Object> returnMap = new Map<String,Object>();

        returnMap.put('grade',grade);
        returnMap.put('allGrade',allGrade);

        return returnMap;
    }
}