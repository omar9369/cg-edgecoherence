var view;
var ctx;
var convexPoints = new Array();
var concavePoints = new Array();
var polygons = {
    convex: {
        color: "rgb(155, 102, 102)", // choose color here!
        vertices: [
            convexPoints[0] = new Array(100, 100),
            convexPoints[1] = new Array(600, 150),
            convexPoints[2] = new Array(700, 400),
            convexPoints[3] = new Array(500, 450),
            convexPoints[4] = new Array(200, 350)

        ]
    },
    concave: {
        color: "rgb(0, 255, 0)", // choose color here!
        vertices: [
            convexPoints[0] = new Array(100, 100),
            convexPoints[1] = new Array(600, 150),
            convexPoints[2] = new Array(700, 500),
            convexPoints[3] = new Array(300, 300),
            convexPoints[4] = new Array(200, 550)
            // fill in vertices here!
        ]
    },
    self_intersect: {
        color: 	"rgb(204, 0, 0)", // choose color here!
        vertices: [
            convexPoints[0] = new Array(100, 100),
            convexPoints[1] = new Array(600, 600),
            convexPoints[2] = new Array(600, 200),
            convexPoints[3] = new Array(200, 600)
            // fill in vertices here!
        ]
    },
    interior_hole: {
        color: 	"rgb(0, 0, 204)", // choose color here!
        vertices: [
            convexPoints[0] = new Array(100, 100),
            convexPoints[1] = new Array(400, 200),
            convexPoints[2] = new Array(200, 200),
            convexPoints[3] = new Array(600, 100),
            convexPoints[4] = new Array(600, 400),
            convexPoints[5] = new Array(200, 400)
            // fill in vertices here!
        ]
    }
};

// Init(): triggered when web page loads
function Init() {
    var w = 800;
    var h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;
    ctx = view.getContext('2d');
    SelectNewPolygon();
}

// DrawPolygon(polygon): erases current framebuffer, then draws new polygon
function DrawPolygon(polygon) {
    // Clear framebuffer (i.e. erase previous content)
    ctx.clearRect(0, 0, view.width, view.height);

    // Set line stroke color
    ctx.strokeStyle = polygon.color;

    // Create empty edge table (ET)
    var edge_table = [];
    var i;
    for (i = 0; i < view.height; i++) {
        edge_table.push(new EdgeList());
    }

    // Create empty active list (AL)
    var active_list = new EdgeList();

    var polygon_y_max = 0;
    // Step 1: populate ET with edges of polygon
    var i = 0;
    var firstVertex = {};
    var secondVertex = {};
    var array_vertices = polygon.vertices;
    for (i = 0; i < array_vertices.length; i++){
        firstVertex = {
            x: array_vertices[i][0],
            y: array_vertices[i][1]
        }
        if(i+1 === array_vertices.length){
            secondVertex = {
                x: array_vertices[0][0],
                y: array_vertices[0][1]
            }
        }else{
            secondVertex = {
                x: array_vertices[i+1][0],
                y: array_vertices[i+1][1]
            }
        }
        var index = Math.min(firstVertex.y, secondVertex.y);
        var max_y = Math.max(firstVertex.y, secondVertex.y);
        var deltax;
        var deltay;
        if(firstVertex.y < secondVertex.y){
            var min_x = firstVertex.x;
            deltax = secondVertex.x - firstVertex.x;
            deltay = secondVertex.y - firstVertex.y;
        }else{
            var min_x = secondVertex.x;
            deltax = firstVertex.x - secondVertex.x;
            deltay = firstVertex.y - secondVertex.y;
        }
        var edges = new EdgeEntry(max_y, min_x, deltax, deltay);   
        edge_table[index].InsertEdge(edges);
        if(polygon_y_max < max_y){
            polygon_y_max = max_y
        }
    }
    // Step 2: set y to first scan line with an entry in ET
    // loop through all the vertices until you find the smallest y
    var i = 0;
    low_y = array_vertices[0][1];
    for (i = 0; i < array_vertices.length-1; i++){
        var temp_y = array_vertices[i][1];
        if(temp_y < low_y){
            low_y = temp_y;
        }
    }
    var y = low_y;
    var x = edge_table[low_y];
    // Step 3: Repeat until ET[y] is NULL and AL is NULL
    //   a) Move all entries at ET[y] into AL
    //   b) Sort AL to maintain ascending x-value order
    //   c) Remove entries from AL whose ymax equals y
    //   d) Draw horizontal line for each span (pairs of entries in the AL)
    //   e) Increment y by 1
    //   f) Update x-values for all remaining entries in the AL (increment by 1/m)
    var i;
    // Step 3: Repeat until ET[y] is NULL and AL is NULL
    for (i = y; i < polygon_y_max ; i++){
        //   a) Move all entries at ET[y] into AL
        var cur_entry = edge_table[i].first_entry;
        while(cur_entry !== null){
            active_list.InsertEdge(cur_entry);
            cur_entry = cur_entry.next_entry;
        }
        //   b) Sort AL to maintain ascending x-value order
        active_list.SortList();
        
        //   c) Remove entries from AL whose ymax equals y
        active_list.RemoveCompleteEdges(i);
        var curr = active_list.first_entry;
        //   d) Draw horizontal line for each span (pairs of entries in the AL)
        while (curr != null) {
            //in draw line it will be curr.x then will jump 2 to get third and fourth instead of 2nd and third 
            DrawLine(curr.x, i, curr.next_entry.x, i);
            curr = curr.next_entry.next_entry;
            y++
        }
        //   f) Update x-values for all remaining entries in the AL (increment by 1/m)
        var curr = active_list.first_entry;
        while(curr != null){
            var x_value = curr.x;
            var slope = curr.inv_slope;
            var updated_x = x_value + slope;
            curr.x = updated_x;
            curr = curr.next_entry;
        }
    }
 
}
// SelectNewPolygon(): triggered when new selection in drop down menu is made
function SelectNewPolygon() {
    var polygon_type = document.getElementById('polygon_type');
    DrawPolygon(polygons[polygon_type.value]);
}

function DrawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
