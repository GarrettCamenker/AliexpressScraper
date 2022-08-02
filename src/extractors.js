const safeEval = require('safe-eval');
const flattenDeep = require('lodash/flattenDeep');

// Fetch all main category paths from homepage
const getAllMainCategoryPaths = ($) => {
    return $('dd.sub-cate').map((i, el) => $(el).data('path')).get();
};

// Fetch every subcategory hidden pages (loaders)
const getAllSubCategories = async ($) => {
    const dataScript = $($('script').filter((i, script) => $(script).html().includes('runParams')).get()[0]).html();

    const data = flattenDeep(JSON.parse(
        dataScript.split('window.runParams = ')[2].split('window.runParams.csrfToken =')[0].replace(/;/g, ''),
    ).refineCategory
        .map(category => category.childCategories))
        .filter(el => el).map(item => ({ name: item.categoryName, link: `https:${item.categoryUrl}` }));

    return data;
};

// Filters sub categories with given options
const filterSubCategories = (categoryStartIndex = 0, categoryEndIndex = null, subCategories) => {
    // Calculate end index
    const endIndex = categoryEndIndex > 0 ? categoryEndIndex : subCategories.length - 1;

    // Slice array
    return subCategories.slice(categoryStartIndex, endIndex);
};

// Fetch all products from a global object `runParams`
const getProductsOfPage = ($) => {
    const dataScript = $($('script').filter((i, script) => $(script).html().includes('runParams')).get()[0]).html();
    const data = JSON.parse(
        dataScript.split('window.runParams = ')[2].split('window.runParams.csrfToken =')[0].replace(/;/g, ''),
    );

    if (!data.success) {
        throw new Error('We got blocked when trying to fetch products!');
    }

    return data.items && data.items.length > 0 ? data.items.map(item => ({ id: item.productId, name: item.title, link: item.productDetailUrl })) : [];
};

// Fetch basic product detail from a global object `runParams`
const getProductDetail = ($, url) => {
    const dataScript = $($('script').filter((i, script) => $(script).html().includes('runParams')).get()[0]).html();

    const { data } = safeEval(dataScript.split('window.runParams = ')[1].split('var GaData')[0].replace(/;/g, ''));

    const {
        actionModule,
        titleModule,
        storeModule,
        specsModule,
        imageModule,
        descriptionModule,
        skuModule,
        crossLinkModule,
        recommendModule,
        commonModule,
    } = data;


    return {
        id: actionModule.productId,
        link: url,
        product_name: titleModule.subject,
        qty_sold: `${titleModule.tradeCount ? titleModule.tradeCount : ''} ${titleModule.tradeCountUnit ? titleModule.tradeCountUnit : ''}`,
        rating: titleModule.feedbackRating.averageStar,
        supplier: {
            date_established: storeModule.openTime,
            qty_ratings: storeModule.positiveNum,
            rating: storeModule.positiveRate,
            name: storeModule.storeName,
            supplier_id: storeModule.storeNum,
        },
        levels: crossLinkModule.breadCrumbPathList
            .map(breadcrumb => breadcrumb.target)
            .filter(breadcrumb => breadcrumb),
        quantity: actionModule.totalAvailQuantity,
        images: imageModule.imagePathList,
        skuOptions: skuModule.productSKUPropertyList ? skuModule.productSKUPropertyList
            .map(skuOption => ({
                name: skuOption.skuPropertyName,
                values: skuOption.skuPropertyValues
                    .map(skuPropVal => skuPropVal.propertyValueDefinitionName),
            })) : [],
        attributes: skuModule.skuPriceList.map(skuPriceItem => ({
            attribute_id:skupri,
            product_id:0,
            qty_avail:0,
            qty_sold:0,
            features:skuPriceItem.skuPropIds,
            price: skuPriceItem.skuVal.skuAmount.formatedAmount,
        }))
    };
};


// Get description HTML of product
const getProductDescription = async ($) => {
    return $.html();
};


module.exports = {
    getAllMainCategoryPaths,
    getAllSubCategories,
    filterSubCategories,
    getProductsOfPage,
    getProductDetail,
    getProductDescription,
};
