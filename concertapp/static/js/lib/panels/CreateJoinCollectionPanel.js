/**
*  @file       CreateJoinCollectionPanel.js
*  This is the panel that allows a user to create or join a group on the settings
*  page.
*  @author     Colin Sullivan <colinsul [at] gmail.com>
**/

function CreateJoinCollectionPanel(params) {
    if(params) {
        this.init(params);
    }
}
CreateJoinCollectionPanel.prototype = new Panel();

/**
*  Initialize all stuffs.  We have an element for the input, as well as for the
*  results.
*
*  @param  inputElement          jQuery HTMLInputElement for the input
*                                          text box.
*  @param  resultsElement        jQuery HTMLDivElement for the results
*                                          dropdown.
*  @param  resultTemplate        jQuery tmpl script element.  The template
*                                          for results in the auto-complete dropdown
*  @param  createNewTemplate     jQuery tmpl - the template for the 
*                                          "Create new collection"  button in the
*                                          auto complete dropdown.
**/
CreateJoinCollectionPanel.prototype.init = function(params) {
    Panel.prototype.init.call(this, params);

    var inputElement = params.inputElement;
    if(typeof(inputElement) == 'undefined') {
        throw new Error('params.inputElement is undefined');
    }
    this.inputElement = inputElement;

    var resultsElement = params.resultsElement;
    if(typeof(resultsElement) == 'undefined') {
        throw new Error('params.resultsElement is undefined');
    }
    this.resultsElement = resultsElement;

    var resultTemplate = params.resultTemplate;
    if(typeof(resultTemplate) == 'undefined') {
        throw new Error('params.resultTemplate is undefined');
    }
    this.resultTemplate = resultTemplate;

    var createNewTemplate = params.createNewTemplate;
    if(typeof(createNewTemplate) == 'undefined') {
        throw new Error('params.createNewTemplate is undefined');
    }
    this.createNewTemplate = createNewTemplate;

    /* This will hold a reference so we can keep track of the last Xhr */
    this.lastCreateJoinXhr = null;

    /* The current search term in the box */
    this.currentTerm = null;

    /* Auto complete behavior */
    this.initAutoCompleteBehavior();
    
    /* When "create new collection" button is pressed */
    $('#create_new_collection').live('click', function(me) {
        return function() {
            me.createNewCollection({
                collection_name: $(this).attr('data-collection_name'), 
            });
        };
    }(this));
    
    /* Reference to ManageCollectionsPanel so we can run methods on there */
    this.manageCollectionsPanel = null;
}

/**
 *  This should be called from init just once, to initialize the auto complete
 *  behavior for the input element.
 **/
CreateJoinCollectionPanel.prototype.initAutoCompleteBehavior = function() {
    /* The actual jQuery UI autocomplete call */
    this.inputElement.autocomplete({
        minLength: 0,
        source: function(me) {
            return function(request, response) {
                /* Our search term */
                var term = request.term;

                /* If there is something to search for */
                if(term && term != '') {    
                    /* Search for it */
                    me.lastCreateJoinXhr = $.getJSON(
                        'search/'+term, 
                        {}, 
                        function(data, status, xhr) {
                            /* If this was the last request made (ignore previous) */
                            if(xhr === me.lastCreateJoinXhr) {
                                me.currentTerm = term;
                                me.autoCompleteResponse(data);
                            }
                        }
                    );
                }
                /* Search is empty */
                else {
                    me.currentTerm = term;
                    me.autoCompleteResponse([]);
                }
            };

        }(this),

        open: function(event, ui) {
        },

        change: function(event, ui) {
        },

        search: function(event, ui) {
        }
    });
}

/**
*  This should be called when an autocomplete request finishes, and we wish
*  to display the results to the user.
*
*  @param  data        Object  - JSON data from server about collection search
*                                  results.
**/
CreateJoinCollectionPanel.prototype.autoCompleteResponse = function(data) {
    var resultsContainer = this.resultsElement;
    var createNewTemplate = this.createNewTemplate;
    var resultTemplate = this.resultTemplate;
    var term = this.currentTerm;
    /* results were found! */
    if(data.length) {
        /* Temporary structure for results */
        var frag = document.createDocumentFragment();

        /* For each result */
        for(i = 0, il = data.length; i < il; i++) {
            var obj = data[i].fields
            /* Add to fragment */
            frag.appendChild(resultTemplate.tmpl({
                name: obj.name, 
                id: obj.pk
            }).get(0));
        }
        /* empty results container */
        resultsContainer.empty();
        /* Put results in container */
        resultsContainer.append(frag);
    }
    /* No results :( */
    else if(term != '') {
        /* results container will just be "create new" option */
        resultsContainer.html(createNewTemplate.tmpl({
            term: term, 
        }));
    }
    /* No search term */
    else {
        resultsContainer.empty();
    }
}

/**
 *  Should be called when the 'Create new collection' button is pressed.  This
 *  behavior is defined in init. 
 *
 *  @param  params.collection_name        String  - The name of the collection to 
 *                                          create.
 **/
CreateJoinCollectionPanel.prototype.createNewCollection = function(params) {
    /* Add new collection */
    $.ajax({
        type: 'POST',
        url: 'add/',
        data: { name: params.collection_name },
        success: function(me) {
            return function(data, status, xhr) {
                /* if collection was added */
                if(data == 'success') {
                    /* notify user */
                    com.concertsoundorganizer.notifier.alert({
                        'title': 'Success!', 
                        'content': 'Your collection was created succesfully.'
                    });

                    /* Update collection table */
                    me.manageCollectionsPanel.retrieveAndUpdateCollections();
                    
                    /* Clear text field */
                    me.inputElement.val('');
                    me.currentTerm = '';
                    /* Clear auto complete */
                    me.autoCompleteResponse([]);

                }
                /* an error occurred */
                else {
                    com.concertsoundorganizer.notifier.alert({
                        'title': 'Error',
                        'content': 'Your collection was not created.'
                    });

                    this.resultsElement.empty();
                }
            };
        }(this)
    });
}