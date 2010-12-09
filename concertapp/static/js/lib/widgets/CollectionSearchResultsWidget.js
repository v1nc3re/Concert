/**
 *  @file       CollectionSearchResultsWidget.js
 *  
 *  @author     Colin Sullivan <colinsul [at] gmail.com>
 **/
 
/**
 *  This is the widget that displays the search results when searching for a
 *  collection.
 *  @class
 *  @extends Widget
 **/
var CollectionSearchResultsWidget = Widget.extend({
    
    initialize: function() {
        Widget.prototype.initialize.call(this);

        var params = this.options;
        
        var resultTemplate = $('#create_join_result_template');
        if(typeof(resultTemplate) == 'undefined' || resultTemplate.length == 0) {
            throw new Error('resultTemplate not found');
        }
        this.resultTemplate = resultTemplate;
        
        var createNewTemplate = $('#create_join_create_new_template');
        if(typeof(createNewTemplate) == 'undefined' || createNewTemplate.length == 0) {
            throw new Error('createNewTemplate not found');
        }
        this.createNewTemplate = createNewTemplate;
        

        /* Bind collection events to render */
        var collections = this.collection;
        collections.bind('refresh', this.render);
        collections.bind('add', this.render);
        collections.bind('remove', this.render);
    },
    render: function() {
        
        var collections = this.collection;

        /* Clear results */
        $(this.el).empty();
        
        var resultTemplate = this.resultTemplate;
        
        var frag = document.createDocumentFragment();
        
        var currentTerm = this.panel.currentTerm;
        var exact = this.panel.exactResult;
        
        if(!exact && currentTerm != '') {
            frag.appendChild(this.createNewTemplate.tmpl({
                term: currentTerm, 
            }).get(0));
        }
        
        if(collections.length) {
            /* For each element in the collection */
            collections.each(function(frag, resultTemplate, panel) {
                return function(collection){

                    /* Create a CollectionSearchResult widget */
                    var widget = new CollectionSearchResultWidget({
                        template: resultTemplate, 
                        model: collection,
                        panel: panel, 
                    });

                    frag.appendChild(widget.el);

                };
            }(frag, resultTemplate, this.panel));            
        }
        
        $(this.el).html(frag);
        return this;
    }
});