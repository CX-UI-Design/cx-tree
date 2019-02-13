import {markNodeData} from "../../../../element-tree/src/model/util";

import {objectAssign} from "../utils";

const getPropertyFromData = function (node, prop) {
    const props = node.store.props;//当前节点  props 属性（用户可自定义设置更改)
    const data = node.data || {};//当前节点数据
    const keyTrans = props[prop]; //props  中对应字段的属性值

    //若为函数
    if (typeof keyTrans === 'function') {
        return keyTrans(data, node);
    }
    //若为字符串
    else if (typeof keyTrans === 'string') {
        // console.log(JSON.stringify(data, null, 4))
        // console.log(JSON.stringify(data[AttVal], null, 4))
        return data[keyTrans];//用该字段值到节点数据中取值输出
    }
    //若为不存在（未定义)（ 用户可自定义设置更改后，props中不存在该字段key )
    else if (typeof keyTrans === 'undefined') {
        const dataProp = data[prop];//用该字段key到节点数据中取值输出
        return dataProp === undefined ? '' : dataProp;
    }
};
export default class Node {
    constructor(options) {

        // console.log('node - options');
        // console.log(options);
        this.text = null;

        this.checked = false;//选中状态
        this.indeterminate = false;//全选 / 半选状态

        this.data = null;//树 渲染数据

        this.parent = null;//父 node 信息
        this.visible = true;//显示状态

        this.expanded = false;//开闭状态

        this.branchID = null; //该 node 节点 的唯一 ID

        this.childNodes = [];//存放  子node节点数据

        //绑定对应的属性值 到 constructor 中
        for (let name in options) {
            if (options.hasOwnProperty(name)) {
                this[name] = options[name];
            }
        }

        this.level = 0;//初始化的时候层级 0
        this.loaded = false;

        //若该层存在 parent 字段的内容 （ 非最顶层 )
        //我们已经约定 最顶层 level = 0 了
        if (this.parent) {
            this.level = this.parent.level + 1;//该层级 递增1
        }


        //获取 store 对象
        const store = this.store;
        if (!store) {
            throw new Error('[Node]store is required!');
        }

        //注册 node 节点
        store.registerNode(this);


        const props = store.props;


        //用户自定义 props 属性存在  且 设定了 isLeaf 对应的字段名称
        if (props && typeof props.isLeaf !== 'undefined') {
            const isLeaf = getPropertyFromData(this, 'isLeaf');
            // console.log('isLeaf-isLeaf');
            // console.log(isLeaf);
            if (typeof isLeaf === 'boolean') {
                this.isLeafByUser = isLeaf;
            }
        }

        //设置注入组件数据
        this.setTreeData(this.data);

        this.updateLeafState();//更新 leaf 状态值


        const defaultExpandedKeys = store.defaultExpandedKeys;
        const nodeKey = store.nodeKey;//获取到 树的 nodeKey 标识符


        console.log('node - defaultExpandedKeys');
        console.log(store);
        console.log(this.data.id);
        console.log(defaultExpandedKeys);

        //默认展开所有节点的情况下，直接修改其 expanded 状态值为 true
        if (store.defaultExpandAll) {
            this.expanded = true;
        }


        if (nodeKey && defaultExpandedKeys && defaultExpandedKeys.indexOf(this.key) !== -1) {
            console.log('当前节点id在默认展开地列表中');
            this.expand(null, store.autoExpandParent)//展开对应的节点
        }
        else {
            console.log('当前节点id不在默认展开地列表中')
        }

        //
        /**
         *  条件判断：
         *  1、currentNodeKey 存在（ 初始化设置或者用户点击节点 )
         *  2、当前节点的 key 值 是否等于 currentNodeKey （ 即该节点是否为 currentNodeKey 所对应的节点 )
         *  初始化通过 currentNodeKey 的值去锁定设置对应的 currentNode 的值
         */
        if (nodeKey && store.currentNodeKey !== undefined && this.key === store.currentNodeKey) {
            store.currentNode = this;
        }
    }

    /**
     * 获取该节点的 key 值
     * @returns {*}
     */
    get key() {
        const nodeKey = this.store.nodeKey;//获取到 树的 nodeKey 标识符
        if (this.data) return this.data[nodeKey];//从该节点data数据对象中获取 key 唯一值
        return null;
    }

    //label
    get label() {
        // console.log('label');
        // console.log(this.data.label);
        return this.data.label;
        // return getPropertyFromData(this, 'label');
    }

    //disabled
    get disabled() {
        return getPropertyFromData(this, 'disabled');
    }

    /**
     * collapse 节点收起
     */
    collapse() {
        this.expanded = false;
    }


    /**
     * expand 节点展开
     * @param callback （ 回调函数 )
     * @param isAutoExpandParent ( 展开子节点的时候是否自动展开父节点 )
     */
    expand(callback, isAutoExpandParent) {
        const done = () => {
            //当展开子节点的时候是否自动展开父节点时，向上递归设置每一父级的展开状态值，知道最顶层
            if (isAutoExpandParent) {
                let parent = this.parent;
                while (parent.level > 0) {
                    parent.expanded = true;
                    parent = parent.parent;
                }
            }
            this.expanded = true;
            if (callback) callback();
        };
        done();
    }


    setTreeData(data) {
        console.log('树组件的data:')
        console.log(data);
        if (!Array.isArray(data)) {
            // markNodeData(this, data);
        }


        this.data = data;
        this.childNodes = [];
        let children;


        //data为一个数组的话 （最外层渲染的情况下）
        if (this.data instanceof Array) {
            children = this.data;
        }
        //data为不为一个数组的话 （内层层渲染的情况下）
        else {
            children = getPropertyFromData(this, 'children') || [];//往下层层遍历的情况下 ，若对象下没有children 字段 ，则赋值为空数组
        }

        for (let i = 0, j = children.length; i < j; i++) {

            this.insertChild({data: children[i]});
            // this.label = children[i].label;
            // this.childNodes.push(this);
        }

        // console.log('childNodes-childNodes-childNodes')
        // console.log(this.childNodes)


    }


    /**
     * insertChild
     * @param child     子节点 数据
     * @param index
     * @param batch
     */
    insertChild(child, index, batch) {
        // console.log('insertChild');
        // console.log(child)
        objectAssign(child, {
            parent: this,
            store: this.store
        });
        child = new Node(child); //子节点数据  => 子节点 node 对象

        this.childNodes.push(child);//推入子节点数组中

        //若该层存在 child 字段的内容 （ 此层的子级相对于此层（父级）， level值大1 )
        child.level = this.level + 1;//其子级层级 level 递增 1

        this.updateLeafState();//更新 Leaf 状态值

    }


    //更新 Leaf 状态值
    updateLeafState() {
        //懒加载的情况  且 loaded 属性值为false  isLeafByUser 值存在  => 用户自己自定义 isleaf 的属性值
        if (this.store.lazy === true && this.loaded !== true && typeof this.isLeafByUser !== 'undefined') {
            this.isLeaf = this.isLeafByUser;
            return;
        }
        const childNodes = this.childNodes;
        if (!this.store.lazy || (this.store.lazy === true && this.loaded === true)) {
            this.isLeaf = !childNodes || childNodes.length === 0; //该节点下没有子节点了（ childNodes的值不存在或者为空 )，则 isLeaf 为 true
            return;
        }
        this.isLeaf = false;//其余一切情况都为false
    }


    /**
     * 创建该 node 节点 的唯一 ID
     * @param id
     */
    createBranchID(id) {
        if (this.parent && this.parent.branchID) {
            this.branchID = this.parent.branchID + '-' + id
        }
        else {
            this.branchID = this.branchID + id + '';
        }

        console.log(this.branchID);
    }


    /**
     * set checked state 设置节点 Node 选中状态值
     * @param value   checkbox 勾选的状态值
     * @param deep
     * @param recursion
     * @param passValue
     */
    setChecked(value, deep, recursion, passValue) {
        this.indeterminate = value === 'half';
        this.checked = value === true;

        /**
         * checkStrictly: 在显示复选框的情况下，是否严格的遵循父子不互相关联的做法
         * 若为互不关联，因为彼此独立，则无需进行后续操作，直接跳出
         */
        if (this.store.checkStrictly) return;


    }
}


