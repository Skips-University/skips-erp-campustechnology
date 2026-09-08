export const routeTitles = {
    // Purchase User
    '/role/dashchattest4d': 'AI Chatbot',
    '/role/dashmtall': 'Config Tables',
    '/role/dashmtfields': 'Config Fields',
    '/role/dashmtbcolumnsall': 'Columns',
    '/role/dashmtblapi': 'API Configuration',
    '/role/apichatbot': 'API Chatbot',
    '/role/apichatbot1': 'AI API Report',
    '/role/apiconfig': 'Configure API',
    '/role/aidatamanager': 'AI Data Upload API',
    '/role/dataconfig': 'Configure API Data',
    '/role/workflowchatbotds': 'Work Flow Chatbot',
    '/role/workflowconfigds': 'Work Flow Config',
    '/role/workflowchatbotds1': 'New Work Flow Chatbot',
    '/role/workflowconfigds1': 'New Work Flow Config',
    '/role/purchase-order-dashboard': 'PO Dashboard',
    '/role/PurchaseCellInventoryds': 'Store Inventory',
    '/role/purchasing-master-data': 'Purchase Master Data',
    '/role/ApprovalConfigurationds': 'Approval Configuration',
    '/role/vendor-comparison': 'Vendor Comparison',
    '/role/ItemCategoryds': 'Item Categories',
    '/role/ItemTypeds': 'Item Types',
    '/role/ItemUnitds': 'Item Units',
    '/role/purchase-user-add': 'Add User',
    '/creategrievanceds1': 'Raised ticket',
    '/manageapikeyds': 'Gemini API Key',
    '/geminichatds': 'Chat to Solve',
    '/role/store-manager-dashboard': 'Store',
    '/role/delivery-dashboard': 'Delivery Management',

    // Store Manager
    // (Many overlap with Purchase User, adding unique ones if any)

    // Officer Executive
    '/role/oe-dashboard': 'OE Dashboard',
    // '/role/purchase-order-dashboard': 'Purchase Orders', // Duplicate key, handled by first one, titles are similar
    // '/role/PurchaseCellInventoryds': 'Store Inventory', // Duplicate

    // Competent Authority
    // '/role/purchase-order-dashboard': 'PO Approval', // Duplicate key. Will use the one defined first or last depending on load order. Since it's a map, let's stick to a generic one or the most common one. 'PO Dashboard' seems fine, or we could make it 'Purchase Order Dashboard'.

    // Administrative Officer
    '/storerequisationds': 'Store Requisition'
};

export const getTitle = (pathname) => {
    // Exact match
    if (routeTitles[pathname]) {
        return routeTitles[pathname];
    }

    // Check for dynamic routes if necessary (e.g. ending with ID)
    // For now, simple exact match based on the provided menu files

    return 'Dashboard'; // Fallback
};
