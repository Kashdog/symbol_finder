/*
 * Functions pertaining to the google image search
 * Savvas Petridis
 * March 27, 2019
 *
*/


var api_key = "AIzaSyAESVpO4MezLK49T34nCII89tY6Bz5dW74"

// Extracts the actual urls from the Google API results
extract_links = function(search_results){
  urls = [];
  for (i = 0; i < 10; i++) { 
    url = search_results['items'][i]['link']; 
    urls.push(url);
  }
  return urls;
}

goog = function(t){
  

  return $.ajax({
            type: "GET",
            dataType: 'JSON', 
            url: "https://www.googleapis.com/customsearch/v1",
            data: ({ 'key':  api_key,
                     'cx': '015890050991066315514:iz21fmvdyja',
                     'alt':  'json',
                     'q':  t,
                     'searchType': 'image',
                     'imgType': 'animated',
                     'filter': '1', // removes duplicates?
                     'start': '1', // starting image for search (can only return 10 at a time)
                  }),
            jsonp: "$callback",
            beforeSend: function(xhr){xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5)\AppleWebKit/537.36 (KHTML, like Gecko) Cafari/537.36');},
            success: function( e, data ) {  
              console.log("google search success for "+ t +"!");
            } 
        }); 
}

cluster_google_search = function(cluster_title){
  // var api_key = "enter your google api_key here";
  var async_request=[];
  var responses=[];
  var cluster_words = cluster_title.split(",");
  var order = [];
  for(var i = 0; i < cluster_words.length; i++){
    var cluster_word = cluster_words[i];
    async_request.push($.ajax({
        type: "GET",
        dataType: 'JSON', 
        url: "https://www.googleapis.com/customsearch/v1",
        data: ({ 'key':  api_key,
                 'cx': '015890050991066315514:iz21fmvdyja',
                 'alt':  'json',
                 'q':  cluster_word,
                 'searchType': 'image',
                 'imgType': 'animated',
                 'filter': '1', // removes duplicates?
                 'start': '1', // starting image for search (can only return 10 at a time)
              }),
        jsonp: "$callback",
        beforeSend: function(xhr){xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5)\AppleWebKit/537.36 (KHTML, like Gecko) Cafari/537.36');},
        success: function( e, data ) {  
          console.log(i)
          responses.push(e);
        } 
    }));

    async_request.push($.ajax({
        type: "GET",
        dataType: 'JSON', 
        url: "https://www.googleapis.com/customsearch/v1",
        data: ({ 'key':  api_key,
                 'cx': '015890050991066315514:iz21fmvdyja',
                 'alt':  'json',
                 'q':  concept_searched + " " + cluster_word,
                 'searchType': 'image',
                 'imgType': 'animated',
                 'filter': '1', // removes duplicates?
                 'start': '1', // starting image for search (can only return 10 at a time)
              }),
        jsonp: "$callback",
        beforeSend: function(xhr){xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5)\AppleWebKit/537.36 (KHTML, like Gecko) Cafari/537.36');},
        success: function( e, data ) {  
          console.log(i)
          responses.push(e);
        } 
    }));

    order_obj = {};
    order_obj.search_term = cluster_word;
    order_obj.concept = cluster_word;

    order_obj2 = {};
    order_obj2.search_term = concept_searched + " " + cluster_word;
    order_obj2.concept = cluster_word;

    order.push(order_obj);
    order.push(order_obj2);

    // order.push(cluster_word);
    // order.push(concept_searched + " " + cluster_word);
  }

  $.when.apply(null,async_request).done(function(){
    console.log("all requests complete.")
    console.log(responses);
    var url_obj = {};
    for(var i = 0; i < responses.length; i++){
      var response = responses[i];
      var search_term = response.queries.request[0].searchTerms;
      var urls = extract_links(response);
      url_obj[search_term] = urls;
    }
    fill_grids_for_cluster_concept(url_obj,cluster_title,order);
  });

}


multi_google_search = function(term,parent_term,tree_title_click,tree_node_key){
  console.log("calling multi_google_search!!")
  
  var parent_child_search = parent_term + " " + term;
  var icon_search = term + " icon";
  // var stock_search = term + " stock";
  var root_term_search = concept_searched + " " + term;


  // $.when(goog(term), goog(parent_child_search), goog(icon_search), goog(stock_search), goog(root_term_search)).done(function(g1, g2, g3, g4, g5){
    $.when(goog(term), goog(parent_child_search), goog(icon_search), goog(root_term_search)).done(function(g1, g2, g3, g5){

    var url_obj = {};
    var urls_1 = extract_links(g1[0]);
    var urls_2 = extract_links(g2[0]);
    var urls_3 = extract_links(g3[0]);
    // var urls_4 = extract_links(g4[0]);
    var urls_5 = extract_links(g5[0])
    
    url_obj[term] = urls_1;
    url_obj[parent_child_search] = urls_2; 
    url_obj[root_term_search] = urls_5;
    url_obj[icon_search] = urls_3;
    // url_obj[stock_search] = urls_4;
    
    if(term in concept_dict){
      concept_dict[term].urls = url_obj;
    }
    else{
      concept_dict[term] = {}
      concept_dict[term].urls = url_obj;
    }

    fill_grids_for_concept(url_obj,term);
    
    // create_image_sidebar2(url_obj,term,tree_node_key);
    
    /*if(tree_title_click == false){
      set_node_image(term);
    }*/
    // return full_url_with_label_list;
  });
}

/*
google_all_clusters = function(clusters){
  var async_request=[];
  var responses=[];
  for(var i = 0; i < clusters.length; i++){
    console.log(clusters[i])

    var cluster_title = clusters[i];
    var cluster_words = cluster_title.split(",");


    
    async_request.push($.ajax({
            type: "GET",
            dataType: 'JSON', 
            url: "https://www.googleapis.com/customsearch/v1",
            data: ({ 'key':  savvas_key,
                     'cx': '015890050991066315514:iz21fmvdyja',
                     'alt':  'json',
                     'q':  clusters[i],
                     'searchType': 'image',
                     'filter': '1', // removes duplicates?
                     'start': '1', // starting image for search (can only return 10 at a time)
                  }),
            jsonp: "$callback",
            success: function( e, data ) {  
              console.log(i)
              responses.push(e);
            } 
        }));
  }

  $.when.apply(null,async_request).done(function(){
    console.log("all requests complete.")
    console.log(responses);
    for(var i = 0; i < responses.length; i++){
      var response = responses[i];
      var search_term = response.queries.request[0].searchTerms;
      var urls = extract_links(response);
      // concept_dict[search_term] = {};
      var url_obj = {};
      url_obj[search_term] = urls;
      concept_dict[search_term].urls = url_obj;
    }
    fill_cluster_image_grids(clusters);
  });
}*/


google_all_clusters = function(clusters){
  // var api_key = "";
  var async_request=[];
  var responses=[];
  var cluster_dict = {};
  var cdict = {};
  for(var i = 0; i < clusters.length; i++){
    console.log(clusters[i])

    var cluster_title = clusters[i];
    cdict[cluster_title] = {};
    var cluster_words = cluster_title.split(",");


    for(var j = 0; j < cluster_words.length; j++){
      var cluster_word = cluster_words[j];
      var cluster_word = cluster_word.trim();
      cluster_dict[cluster_word] = cluster_title;
    }

    // cluster_dict.cluster_title = {};
    // cluster_dict.cluster_title.cluster_words = cluster_words;

    for(var j = 0; j < cluster_words.length; j++){
        var cluster_word = cluster_words[j];
         async_request.push($.ajax({
            type: "GET",
            dataType: 'JSON', 
            url: "https://www.googleapis.com/customsearch/v1",
            data: ({ 'key':  api_key,
                     'cx': '015890050991066315514:iz21fmvdyja',
                     'alt':  'json',
                     'q':  concept_searched + " " +  cluster_word,
                     'searchType': 'image',
                     'imgType': 'animated',
                     'filter': '1', // removes duplicates?
                     'start': '1', // starting image for search (can only return 10 at a time)
                  }),
            jsonp: "$callback",
            beforeSend: function(xhr){xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5)\AppleWebKit/537.36 (KHTML, like Gecko) Cafari/537.36');},
            success: function( e, data ) {  
              console.log(i)
              responses.push(e);
            } 
        }));
    }
  
  }

$.when.apply(null,async_request).done(function(){
    console.log("all requests complete.")
    console.log(responses);
    // var cdict = {}
    for(var i = 0; i < responses.length; i++){
      var response = responses[i];
      var search_term = response.queries.request[0].searchTerms;
      var urls = extract_links(response);
      var actual_word = search_term.replace(concept_searched,"")
      actual_word = actual_word.trim();
      var cluster_title = cluster_dict[actual_word]
      cdict[cluster_title][actual_word] = urls;
    }

    for(var cluster_title in cdict){
      var cluster_words = cluster_title.split(",");
      var final_urls = [];
      var final_url_dict = {};
      for(var j = 0; j < cluster_words.length; j++){
        var cluster_word = cluster_words[j];
        var cluster_word = cluster_word.trim();
        // cluster_dict[cluster_word] = cluster_title;

        cword_urls = cdict[cluster_title][cluster_word];
        cword_urls_first_2 = cword_urls.slice(0,2);
        final_urls = final_urls.concat(cword_urls_first_2);
        final_url_dict[cword_urls[0]] = cluster_word;
        final_url_dict[cword_urls[1]] = cluster_word;
      }

      console.log("final_urls")
      console.log(final_urls)
      var url_obj = {};
      url_obj[cluster_title] = final_urls;
      concept_dict[cluster_title].urls = url_obj;
      concept_dict[cluster_title].url_to_gsterm = final_url_dict;
    }

    fill_cluster_image_grids(clusters);
  });

}







root_google_search = function(term,term_image_grid,padding_div,main_div){
  // var api_key = "";
  $.ajax({
            type: "GET",
            dataType: 'JSON', 
            url: "https://www.googleapis.com/customsearch/v1",
            data: ({ 'key':  api_key,
                     'cx': '015890050991066315514:iz21fmvdyja',
                     'alt':  'json',
                     'q':  term,
                     'searchType': 'image',
                     'imgType': 'animated',
                     'filter': '1', // removes duplicates?
                     'start': '1', // starting image for search (can only return 10 at a time)
                  }),
            jsonp: "$callback",
            beforeSend: function(xhr){xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5)\AppleWebKit/537.36 (KHTML, like Gecko) Cafari/537.36');},
            success: function( e, data ) {  
              urls = extract_links(e);
              // var url_obj = {};
              // url_obj[term] = urls;
              // concept_dict[term].urls = url_obj;

              image_table = create_image_grid(term,urls);
              term_image_grid.appendChild(image_table);
              padding_div.appendChild(term_image_grid);
              main_div.appendChild(padding_div);


            } 
        }); 
}





// Conducts a google image search! returns the urls
google_search = function(term,is_start,tree_click){
  console.log('performing google search!')
  // var api_key = "";
  $.ajax({
            type: "GET",
            dataType: 'JSON', 
            url: "https://www.googleapis.com/customsearch/v1",
            data: ({ 'key':  api_key,
                     'cx': '015890050991066315514:iz21fmvdyja',
                     'alt':  'json',
                     'q':  term,
                     'searchType': 'image',
                     'imgType': 'animated',
                     'filter': '1', // removes duplicates?
                     'start': '1', // starting image for search (can only return 10 at a time)
                  }),
            beforeSend: function(xhr){xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5)\AppleWebKit/537.36 (KHTML, like Gecko) Cafari/537.36');},
            jsonp: "$callback",
            success: function( e, data ) {  
              urls = extract_links(e);
              console.log(urls)

              if(is_start){
                concept_dict[term].urls = urls;
              }
              else{
                console.log(term)
                 console.log(concept_dict)
                 console.log(concept_dict[term])
                 concept_dict[term].urls = urls;
                 // var term_entry = {};
                // term_entry.urls = urls;
                // concept_dict[term] = term_entry;
              }

              if(tree_click == false){
                set_node_image(term);
              }
              create_image_sidebar(urls,term);
            } 
        }); 
}
