
const Mock = require('mockjs');
const units = require('./units');

const fileMap = {
  'RplXtNfjaiYzi40LZQM': 'owner.json',
  'newsee-charge-root-funcid-itemlist': 'charge.json',
  'newsee-pay-root-funcid-paymentcharge': 'payment.json',
  'newsee-bill-root-funcid-billusemanager': 'bill.json',
  'bTSDV0xm8XqttQ54GRy': 'reporting.json',
  '2DEJjvjOcDM5caR4bce': 'settings.json'
};

module.exports = {
  api: [
    {id: "1", method: 'post', path: '/test/post', dataFile: "post.json", describe: "post-test"},
    {id: "2", method: 'get', path: '/test/get', dataFile: "get.json", describe: "get-test"},
    // {
    //   id: "3", method: 'post', path: '/oauth/login', dataFile: "login.json", callback: (rep, res) => {
    //     const fileMap = {
    //       0: "login_male.json",
    //       1: "login_female.json",
    //       2: "login.json"
    //     };
    //
    //     var json = units.getJsonFile(fileMap[rep.body.sex]);
    //     res.json(Mock.mock(json));
    //   },
    //   describe: "post-other-test"
    // },

    // login
    {
      id: "3", method: 'get', path: '/oauth/oauth/query-user-enterprise', dataFile: "query_user_enterprise.json", callback: (rep, res) => {
      let json = units.getJsonFile("query_user_enterprise.json");
      res.json(Mock.mock(json));
    },
      describe: "query-user-enterprise"
    },
    {
      id: "4", method: 'post', path: '/oauth/login', dataFile: "oauth_login.json", callback: (rep, res) => {
      let json = units.getJsonFile("oauth_login.json");
      res.json(Mock.mock(json));
    },
      describe: "oauth-login"
    },

    // menu button websocket-url list-filter list-column
    {
      id: "5", method: 'post', path: '/system/permission/list-menu', dataFile: "list_menu.json", callback: (rep, res) => {
      let json = units.getJsonFile("list_menu.json");
      res.json(Mock.mock(json));
    },
      describe: "list-menu"
    },
    {
      id: "6", method: 'post', path: '/system/permission/list-button', dataFile: "list_button_owner.json", callback: (rep, res) => {
        let json = units.getJsonFile('list_button_' + fileMap[rep.get('funcId')]);
      res.json(Mock.mock(json));
    },
      describe: "list-button"
    },
    {
      id: "7", method: 'get', path: '/system/lcinfo/websocket-url', dataFile: "websocket_url.json", callback: (rep, res) => {
      let json = units.getJsonFile("websocket_url.json");
      res.json(Mock.mock(json));
    },
      describe: "websocket-url"
    },
    {
      id: "8", method: 'get', path: '/log/filter/list-filter', dataFile: "list_filter.json", callback: (rep, res) => {
      let json = units.getJsonFile("list_filter.json");
      res.json(Mock.mock(json));
    },
      describe: "list-filter"
    },
    {
      id: "9", method: 'get', path: '/system/column/list-column', dataFile: "list_column_owner.json", callback: (rep, res) => {
      let json = units.getJsonFile('list_column_' + fileMap[rep.get('funcId')]);
      res.json(Mock.mock(json));
    },
      describe: "list-column"
    },

    // element-tree
    {
      id: "10", method: 'get', path: '/owner/owner-rest/house/house-element-tree', dataFile: "house_tree.json", callback: (rep, res) => {
      let json = units.getJsonFile("house_tree.json");
      res.json(Mock.mock(json));
    },
      describe: "house-element-tree"
    },
    {
      id: "11", method: 'get', path: '/charge/charge/item/list-item-element-tree', dataFile: "list_item_tree.json", callback: (rep, res) => {
      let json = units.getJsonFile("list_item_tree.json");
      res.json(Mock.mock(json));
    },
      describe: "list-item-element-tree"
    },
    {
      id: "12", method: 'get', path: '/system/organization/get-organization-element-tree', dataFile: "organization_tree.json", callback: (rep, res) => {
      let json = units.getJsonFile("organization_tree.json");
      res.json(Mock.mock(json));
    },
      describe: "organization-element-tree"
    },

    // views
    {
      id: "13", method: 'post', path: '/owner/owner-rest/house/house-list', dataFile: "house_list.json", callback: (rep, res) => {
      let json = units.getJsonFile("house_list.json");
      res.json(Mock.mock(json));
    },
      describe: "house-list"
    },
    {
      id: "14", method: 'post', path: '/charge/item/list-item', dataFile: "list_item.json", callback: (rep, res) => {
      let json = units.getJsonFile("list_item.json");
      res.json(Mock.mock(json));
    },
      describe: "list-item"
    },
    {
      id: "15", method: 'post', path: '/bill/paymentChargePay/list-paymentChargePay', dataFile: "list_payment_charge_pay.json", callback: (rep, res) => {
      let json = units.getJsonFile("list_payment_charge_pay.json");
      res.json(Mock.mock(json));
    },
      describe: "list-payment-charge-pay"
    },
    {
      id: "16", method: 'post', path: '/bill/billUseMan/list-billUseMan', dataFile: "list_bill_use_man.json", callback: (rep, res) => {
      let json = units.getJsonFile("list_bill_use_man.json");
      res.json(Mock.mock(json));
    },
      describe: "list-bill-use-man"
    },
    {
      id: "17", method: 'post', path: '/owner/report/project-house', dataFile: "project_house.json", callback: (rep, res) => {
      let json = units.getJsonFile("project_house.json");
      res.json(Mock.mock(json));
    },
      describe: "project-house"
    },
    {
      id: "18", method: 'post', path: '/system/user/list-user', dataFile: "list_user.json", callback: (rep, res) => {
      let json = units.getJsonFile("list_user.json");
      res.json(Mock.mock(json));
    },
      describe: "list-user"
    },
  ]
};


