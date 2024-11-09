// Hàm để thêm một hàng nhập liệu mới
function addInputs() {
  const container = document.getElementById("graph-edges");
  const row = document.createElement("div");
  row.className = "form";
  row.innerHTML = `
        <div class="row">
            <div class="col-sm-3">
                <label>From</label>
            </div>
            <div class="col-sm-3">
                <label>To</label>
            </div>
            <div class="col-sm-3">
                <label>Weight</label>
            </div>
        </div>
        <div class="form-row">
            <div class="col-sm-3">
                <input type="text" class="form-control start-node" maxlength="1" placeholder="A" required>
            </div>
            <div class="col-sm-3">
                <input type="text" class="form-control end-node" maxlength="1" placeholder="B" required>
            </div>
            <div class="col-sm-3">
                <input type="number" class="form-control weight" placeholder="0" required>
            </div>
            <button title="Remove" type="button" class="btn" onclick="removeRow(this)"><i class="ri-delete-bin-line"></i></button>
        </div>`;
  container.appendChild(row);
}

// Hàm để tự động thêm hàng dựa trên số lượng dòng
function createInputs() {
  const nodes = parseInt(document.getElementById("numNodes").value, 10);
  const graph = document.getElementById("graph-edges");
  graph.innerHTML = "";


  // Tạo hàng nhập liệu cho mỗi đường đi có thể có
  for (let i = 0; i < nodes; i++) {
    addInputs();
  }
}

// Hàm để xóa một hàng
function removeRow(button) {
  const row = button.closest(".form");
  if (row) {
    row.remove();
  }
}

// Triển khai thuật toán Dijkstra
function dijkstra(graph, startNode) {
  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(graph));

  Object.keys(graph).forEach((node) => {
    distances[node] = Infinity;
    previous[node] = null;
  });
  distances[startNode] = 0;

  while (unvisited.size > 0) {
    let currentNode = Array.from(unvisited).reduce((a, b) =>
      distances[a] < distances[b] ? a : b
    );
    unvisited.delete(currentNode);

    Object.keys(graph[currentNode]).forEach((neighbor) => {
      const newDistance = distances[currentNode] + graph[currentNode][neighbor];
      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        previous[neighbor] = currentNode;
      }
    });
  }
  return { distances, previous };
}

// Hàm để xây dựng đồ thị từ dữ liệu người dùng nhập vào
function buildGraph() {
  const graph = {};
  const startNodes = document.querySelectorAll(".start-node");
  const endNodes = document.querySelectorAll(".end-node");
  const weights = document.querySelectorAll(".weight");

  startNodes.forEach((startNode, index) => {
    const start = startNode.value.toUpperCase();
    const end = endNodes[index].value.toUpperCase();
    const weight = parseInt(weights[index].value, 10);

    if (!graph[start]) graph[start] = {};
    if (!graph[end]) graph[end] = {};

    graph[start][end] = weight;
    graph[end][start] = weight;
  });
  console.log(graph)
  return graph;
}

// Hàm để truy vết đường đi giữa hai nút
function tracePath(previous, start, end) {
  const path = [];
  let current = end;

  while (current) {
    path.unshift(current);
    current = previous[current];
  }

  if (path[0] !== start) {
    alert("Không tồn tại đường đi giữa các nút đã chọn.");
    return [];
  }

  return path;
}

// Hàm để tạo đồ thị và chạy thuật toán Dijkstra
function generate() {
  const graph = buildGraph();
  const start = document.getElementById("startNode").value.toUpperCase();
  const end = document.getElementById("endNode").value.toUpperCase();

  if (!start || Object.keys(graph).length === 0) {
    alert("Missing data");
    console.log(start, end, graph);
    return;
  }

  if (start === end) {
    alert("Start node and end node cannot be the same.");
    return;
  }

  const { distances, previous } = dijkstra(graph, start);
  let result;

  if (end) {
    // Nếu nút kết thúc được chỉ định, chỉ bao gồm trọng số đường đi từ điểm bắt đầu đến điểm kết thúc
    if (distances[end] === undefined || distances[end] === Infinity) {
      alert("No path exists between the selected nodes.");
      return;
    }
    result = {
      distances,
      previous,
      start,
      end,
      graph,
    };
  } else {
    // Nếu không có nút kết thúc được chỉ định, bao gồm tất cả khoảng cách và các nút trước đó
    result = {
      distances,
      previous,
      start,
      end,
      graph,
    };
  }

  console.log("Kết quả", result);
  localStorage.setItem("dijkstraResult", JSON.stringify(result));
  window.location.href = "./next1.html";
}

// Hàm để hiển thị chi tiết của đường đi
function showDetails(graph, distances, previous, start, end) {
  const path = tracePath(previous, start, end);
  if (path.length === 0) return;

  const details = path
    .map((node, index) => {
      if (index < path.length - 1) {
        const nextNode = path[index + 1];
        const weight = graph[node][nextNode];
        return `
                <div class="form">
                    <div class="row">
                        <div class="col-sm-3"><label>From</label></div>
                        <div class="col-sm-3"><label>To</label></div>
                        <div class="col-sm-3"><label>Weight</label></div>
                    </div>
                    <div class="form-row">
                        <div class="col-sm-3"><input type="text" class="form-control" value="${node}" disabled></div>
                        <div class="col-sm-3"><input type="text" class="form-control" value="${nextNode}" disabled></div>
                        <div class="col-sm-3"><input type="text" class="form-control" value="${weight}" disabled></div>
                    </div>
                </div>`;
      }
    })
    .join("");

  document.getElementById("details").innerHTML = details;
}

// Hàm để chuyển đổi hiển thị chi tiết
function toggleDetails(show) {
  const detail = document.getElementById("details");
  detail.style.display = show ? "block" : "none";
  document.getElementById("see-details").style.display = show
    ? "none"
    : "inline-block";
  document.getElementById("less-details").style.display = show
    ? "inline-block"
    : "none";
}
