function broadcast(componentName, eventName, params) {
    this.$children.forEach(child => {
        var name = child.$options.componentName;

        if (name === componentName) {
            child.$emit.apply(child, [eventName].concat(params));
        } else {
            broadcast.apply(child, [componentName, eventName].concat([params]));
        }
    });
}

export default {
    methods: {
        /**
         * 寻找所有父级，直到找到要找的父组件，并在其身上触发指定事件
         * @param componentName -  组件名
         * @param eventName - 事件名
         * @param params - 数据
         */
        dispatch(componentName, eventName, params) {
            var parent = this.$parent || this.$root;
            var name = parent.$options.componentName;

            while (parent && (!name || name !== componentName)) {
                parent = parent.$parent;

                if (parent) {
                    name = parent.$options.componentName;
                }
            }
            if (parent) {
                parent.$emit.apply(parent, [eventName].concat(params));
            }
        },

        //Element的broadcast虽然与官方的同名，但是通过分析源码可以看出Element的用途应该是 远程调用 或应取名叫childEmit，
        // 用途是调用/触发指定子孙组件的事件。而非广义上的“广播”的概念。
        /**
         * 寻找所有子孙组件中，组件名为componentName的组件，若找到在其组件上触发（$emit）eventName的事件方法，数据为params。
         * @param componentName -  组件名
         * @param eventName - 事件名
         * @param params - 数据
         */
        broadcast(componentName, eventName, params) {
            broadcast.call(this, componentName, eventName, params);
        }
    }
};
