export const preDragItemIndices = {
    itemList: [],
    update: function (items){
        this.itemList = [];
        items.map(item => {
            this.itemList.push(item.id);
        });
    },
    updateByIndex: function(id, index){
        this.itemList.splice(index, 0, id);
    }, 
    indexById: function(id){
        return this.itemList.indexOf(id);
    }
}