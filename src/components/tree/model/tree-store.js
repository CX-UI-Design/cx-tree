import Node from './node';
import {getNodeKey} from "../../../../element-tree/src/model/util";


export default class TreeStore {
    constructor(options) {
        // console.log('TreeStore - options');
        // console.log(options);

        this.currentNode = null;//当前节点
        this.currentNodeKey = null;////当前选中的节点 的 id
        this.nodesMap = {};//节点注册对象 （ 键值对 - key ：node )

        //绑定对应的属性值 到 constructor 中
        for (let option in options) {
            if (options.hasOwnProperty(option)) {
                this[option] = options[option];
            }
        }

        this.root = new Node({
            data: this.data,
            store: this
        });

        //初始化 选中节点
        this._initDefaultCheckedNodes();
    }

    /**
     * filter 删选
     * @param value
     */
    filter(value) {
        const filterNodeMethod = this.filterNodeMethod;//对树节点进行筛选时执行的方法，返回 true 表示这个节点可以显示，返回 false 则表示这个节点会被隐藏
        const traverse = function (node) {
            const childNodes = node.root ? node.root.childNodes : node.childNodes;

            //从外层开始向内设置每个节点的visible值
            childNodes.forEach((child) => {
                //将外置方法 filterNodeMethod 返回值 赋予 visible 字段
                child.visible = filterNodeMethod.call(child, value, child.data, child);

                //向下循环子节点
                traverse(child);
            });

            /**
             * 这里需要注意的是：
             * 如果外层父级节点visible为false，而子级节点visible为true
             * 这种情况下，子级节点需要展示，其父节点也需要展现，故而也应当重新将父节点visible设置为为 true
             */

            //若该节点 visible 为false 且存在子节点的情况，需要进一步验证
            if (!node.visible && childNodes.length) {
                let allHidden = true;

                //其子节点只要有一个 visible 为 true 的情况下，意味着父节点也需要展示
                childNodes.forEach((child) => {
                    if (child.visible) allHidden = false;
                });

                //重新设定该节点 visible 的值
                if (node.root) {
                    node.root.visible = allHidden === false;
                } else {
                    node.visible = allHidden === false;
                }
            }


            if (!value) return;

            if (node.visible && !node.isLeaf) node.expand();//将删选出的 Node 节点（ 非叶子节点 )展开
        };

        //this: TreeStore{},不直接含有childNodes，需在root下获取
        traverse(this);
    }

    //获取节点
    // getNode(data) {
    //     if (data instanceof Node) return data;
    //     const key = typeof data !== 'object' ? data : getNodeKey(this.key, data);
    //     return this.nodesMap[key] || null;
    // }


    /**
     * set data - 设置注入组件数据
     * @param newVal
     */
    setTreeData(newVal) {
        const isDataChanged = newVal !== this.root.data;
        console.log(isDataChanged ? '数据变化，前后数据不一样' : '数据变化，前后数据一样');
        if (isDataChanged) {
            //执行 root 中的 setTreeData 方法后，等于重头创建了一个数据root 数据对象
            this.root.setTreeData(newVal);
        } else {
            // this.root.updateChildren();
        }
    }


    //设置当前节点
    setCurrentNode(node) {
        console.log('setCurrentNode - 设置当前节点');
        this.currentNode = node;
    }

    //输出当前节点
    getCurrentNode() {
        console.log('getCurrentNode - 输出当前节点');
        return this.currentNode;
    }

    //设置当前节点key
    setCurrentNodeKey(node) {
        console.log('setCurrentNodeKey - 设置当前节点key');
        this.currentNodeKey = node.key;
    }

    //输出当前节点key
    getCurrentNodeKey(key) {
        console.log('getCurrentNodeKey - 输出当前节点key');
        return this.currentNodeKey
    }


    //设置默认展开的节点 key
    setDefaultExpandedKeys(keys) {
        console.log('设置默认展开的节点');
        keys = keys || [];
        this.defaultExpandedKeys = keys;
        //同步 执行展开操作
        keys.forEach((key) => {
            console.log(key)
            // const node = this.getNode(key);
            // if (node) node.expand(null, this.autoExpandParent);
        });
    }

    //初始化 选中节点
    _initDefaultCheckedNodes() {
        const defaultCheckedKeys = this.defaultCheckedKeys || [];
        const nodesMap = this.nodesMap;

        console.log('_initDefaultCheckedNodes-_initDefaultCheckedNodes-_initDefaultCheckedNodes-_initDefaultCheckedNodes');
        console.log(this.defaultCheckedKeys);
        console.log(nodesMap);
        //遍历 默认勾选的节点的 key 的数组,在节点注册对象查找对应的 node 节点对象
        defaultCheckedKeys.forEach((checkedKey) => {
            const node = nodesMap[checkedKey];
            console.log(node);
            //若 node 节点对象存在，在对应进行操作
            if (node) {
                //设置节点 Node 选中状态值
                node.setChecked(true, !this.checkStrictly);
            }
        });
    }

    /**
     * setDefaultCheckedKey 设置
     * @param newVal
     */
    setDefaultCheckedKey(newVal) {
        if (newVal !== this.defaultCheckedKeys) {
            this.defaultCheckedKeys = newVal;
            this._initDefaultCheckedNodes();
        }
    }

    /**
     * register node - 注册节点
     * @param node
     */
    registerNode(node) {
        const nodeKey = this.nodeKey;
        if (!nodeKey || !node || !node.data) return;

        const Key = node.key;//获取该节点 node 的 key 值
        //若当前节点存在 key 值 （ 从该节点data数据对象中获取 key 唯一值 )，则在 nodesMap 对象中注入该节点，有key值对应。
        if (Key !== undefined) this.nodesMap[node.key] = node;
    }

    /**
     * deregister node - 注销该节点及其所有子节点在 NodesMap 对象中注册的数据
     * @param node
     */
    deregisterNode(node) {
        const nodeKey = this.nodeKey;
        if (!nodeKey || !node || !node.data) return;//一旦不存在节点node或者不满足条件则跳出

        let i = 1;
        //向下寻找其子节点 执行注销操作
        node.childNodes.forEach(child => {
            this.deregisterNode(child);
            i++;
            console.log(child)
        });
        //注意这里的嵌套循环执行顺序，删除操作是从里向外执行，即，先删除子节点后删除父节点注册对象
        //在 NodesMap 对象中删除该节点对象
        delete this.nodesMap[node.key];
    }


    /**
     * get checked nodes 获取目前被选中的节点所组成的数组
     * 条件 - 若节点可被选择（即 show-checkbox 为 true）
     * @param checkOpt config 选择参数配置项
     *
     *          - leafOnly - 是否为叶子节点（没有子节点）
     *          - includeHalfChecked -  是否包含半选节点
     *          - removal - 是否清楚无效key
     *          - transform - key值转换函数
     *
     * @returns {Array}
     */
    getCheckedNodes(checkOpt) {
        const checkedNodes = [];
        /**
         * node traverse
         * 依次往下遍历出所有符合条件的 Node 节点对象，并推入集合中
         * @param node - node 节点对象
         */
        const nodeTraverse = function (node) {
            const childNodes = node.root ? node.root.childNodes : node.childNodes;

            childNodes.forEach((child) => {

                /**
                 * 不包含半选节点，则只要筛选出其 checked 为true 的节点即可
                 * 包含半选节点 则筛选出 其 indeterminate 为true 的节点
                 * 取或
                 * @type {*|boolean}
                 */
                const checkedState = child.checked || (checkOpt.includeHalfChecked && child.indeterminate);
                /**
                 * 1、若不为叶子节点，则无需筛选
                 * 2、若为叶子节点，删选出其isLeaf为true的节点
                 * 取或
                 * @type {boolean|string|*}
                 */
                const leafState = !checkOpt.leafOnly || (checkOpt.leafOnly && child.isLeaf);
                if (checkedState && leafState) {
                    console.log(child)
                    checkedNodes.push(child);//符合条件，推入数组   单独执行 this.$refs['element-tree'].getCheckedNodes()时会报错
                }
                //往下循环执行
                nodeTraverse(child);
            });
        };

        nodeTraverse(this);

        return checkedNodes;
    }

    /**
     * get checked keys - 获取目前被选中的节点的 key 所组成的数组
     * 条件 - 若节点可被选择（即 show-checkbox 为 true）
     * @param checkOpt config 选择参数配置项
     *
     *          - leafOnly - 是否为叶子节点（没有子节点）
     *          - includeHalfChecked -  是否包含半选节点
     *          - removal - 是否清楚无效key
     *          - transform - key值转换函数
     *
     * @returns {any[]}
     */
    getCheckedKeys(checkOpt = {}) {
        //遍历 Node 数组，从node对象中拿 Key 字段，组合成新数组
        let keysOpts = this.getCheckedNodes(checkOpt).map((node) => {
            const keyName = 'key';
            const key = (node || {})[keyName];
            if (!key) console.warn(`节点名称为：'${node.label}', branchID为：'${node.branchID}'的节点不存在${keyName}值或${keyName}值不符合要求，请为其设置唯一${keyName}值`);
            return key
        });
        //是否清楚无效key
        if (checkOpt.removal) {
            keysOpts = keysOpts.filter(key => key);
        }
        //key换换函数
        if (checkOpt.transform && typeof checkOpt.transform === 'function') {
            keysOpts = keysOpts.map(key => checkOpt.transform(key));
        }
        return keysOpts;
    }

    /**
     * get half checked nodes - 获取目前半选中的节点所组成的数组
     * 条件 - 若节点可被选择（即 show-checkbox 为 true）
     * @returns {Array}
     */
    getHalfCheckedNodes() {
        const HalfCheckedNodes = [];
        const traverse = function (node) {
            const childNodes = node.root ? node.root.childNodes : node.childNodes;

            childNodes.forEach((child) => {
                if (child.indeterminate) {
                    HalfCheckedNodes.push(child);
                }

                traverse(child);
            });
        };

        traverse(this);

        return HalfCheckedNodes;
    }

    /**
     * get half checked keys - 获取目前半选中的节点的 key 所组成的数组
     * 条件 - 若节点可被选择（即 show-checkbox 为 true）
     * @returns {any[]}
     */
    getHalfCheckedKeys() {
        //遍历 Node 数组，从node对象中拿 Key 字段，组合成新数组
        return this.getHalfCheckedNodes().map((node) => {
            const keyName = 'key';
            const key = (node || {})[keyName];
            if (!key) console.warn(`节点名称为：'${node.label}', branchID为：'${node.branchID}'的节点不存在${keyName}值或${keyName}值不符合要求，请为其设置唯一${keyName}值`);
            return key;
        });
    }
}
