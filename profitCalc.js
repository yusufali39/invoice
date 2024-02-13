$(document).ready(function () {
  var items = [];
  var customerName = ""; // Variable to store customer name

  $("#item-form").on("submit", addItemToCart);
  $("#cart-table").on("click", ".btn-danger", removeItemFromCart);
  $("#generate-invoice").on("click", generateInvoice);

  function addItemToCart(event) {
    event.preventDefault();

    var itemName = $("#item-name").val();
    var itemPrice = $("#item-price").val();
    var itemQty = parseInt($("#item-qty").val()); // Parse quantity as integer
    var itemSale = parseInt($("#item-sale").val()); // Parse sale as integer

    if (
        customerName.trim() !== "" &&
        itemName.trim() !== "" &&
        itemPrice.trim() !== "" &&
        !isNaN(itemQty) && // Check if item quantity is a valid number
        !isNaN(itemSale) // Check if item sale is a valid number
    ) {
        var item = {
            name: itemName,
            price: parseFloat(itemPrice),
            qty: itemQty,
            sale: itemSale
        };

        items.push(item);
        $("#cart-table tbody").append(
            "<tr><td>" +
            item.name +
            "</td><td>" +
            item.qty +
            "</td><td>₹" +
            item.price.toFixed(2) +
            "</td><td>₹" +
            (item.qty * item.price).toFixed(2) +
            "</td><td>₹" +
            item.sale +
            "</td><td>₹" +
            (item.qty * item.sale).toFixed(2) +
            "</td><td>₹" +
            ((item.qty * item.sale) - (item.qty * item.price)).toFixed(2) +
            '</td><td><button class= "btn btn-sm btn-danger"><i class="fa fa-trash-alt"></i></button></td></tr>'
        );
        updateTotalQty(); // Update total quantity
        updateTotalCost();
        updateTotalSale();
        updateTotalProfit(); 
        $("#item-name").val("");
        $("#item-price").val("");
        $("#item-qty").val("");
        $("#item-sale").val("");
    } else {
        alert("Please enter valid inputs for customer name, item name, item price, quantity, and sale.");
    }
}


  function removeItemFromCart() {
    updateTotalCost();
    updateTotalSale(); // Update total quantity
    var index = $(this).closest("tr").index();
    items.splice(index, 1);
    $(this).closest("tr").remove();
  }
  function updateTotalQty() {
    var totalQty = 0;
    items.forEach(function (item) {
        totalQty += item.qty; // Calculate total quantity of all items
    });
    $("#total-qty").text("Total Qty: " + totalQty);
}


function updateTotalCost() {
  var totalProfit = 0;
  items.forEach(function (item) {
    totalProfit += (item.qty * item.sale) - (item.qty * item.price); // Calculate total profit
  });
  $("#total-cost").text("Total Profit: ₹" + totalProfit.toFixed(2));
}

function updateTotalProfit() {
  var totalProfit = 0;
  items.forEach(function (item) {
    totalProfit += item.price * item.qty; // Calculate total quantity of all items
  });
  $("#total-purchase").text("Total purchase: ₹" + totalProfit);
}

  function updateTotalSale() {
    var totalSale = 0;
    items.forEach(function (item) {
      totalSale += item.sale * item.qty; // Calculate total quantity of all items
    });
    $("#total-sale").text("Total Sale: ₹" + totalSale);
  }

  function generateInvoice() {
    var invoice = `
    <html>
    <head>
        <title>Invoice</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    </head>
    <body>
        <div class="container mt-5">
            <h3 class="text-center mb-0">Ramadan Garments</h3>
            <p class="text-center mb-0">Thana road, siwan</p>
            <p class="text-center mt-0">8294257086</p>
            <p class="mb-0"><strong>Customer: </strong> ${customerName}</p>
            <p><strong>Date:</strong> ${getCurrentDate()}</p>
            <table class="table">
                <thead>
                    <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Purchase</th>
                    <th>TPAmount</th>
                    <th>Sale</th>
                    <th>TSAmount</th>
                    <th>Profit</th>
                    </tr>
                </thead>
                <tbody>`;

    items.forEach(function (item) {
      invoice += `<tr>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>₹${item.price.toFixed(2)}</td>
      <td>₹${(item.qty * item.price).toFixed(2)}</td>
      <td>${item.sale}</td>
      <td>₹${(item.qty * item.sale).toFixed(2)}</td>
      <td>₹${(item.qty * item.sale) - (item.qty * item.price).toFixed(2)}</td>
      </tr>`;
    });

    invoice += `</tbody></table><footer>
    <p class="mb-0">Total Qty: ${getTotalQty()}</p>
    <p class="mb-0">Total Sale: ₹${getTotalSale()}</p>
    <p class="mb-0">Total Profit: ₹${getTotalCost()}</p>
    <p id="print-button" class="text-center">happy shopping</p>
    </footer></div></body><script>
      document.getElementById('print-button').addEventListener('click', function () {
          window.print();
      });
      </script></html>`;

    var popup = window.open("", "_blank");
    popup.document.open();
    popup.document.write(invoice);
    popup.document.close();
  }

  function getCurrentDate() {
    var currentDate = new Date();
    var dd = String(currentDate.getDate()).padStart(2, "0");
    var mm = String(currentDate.getMonth() + 1).padStart(2, "0"); // January is 0!
    var yyyy = currentDate.getFullYear();

    return dd + "/" + mm + "/" + yyyy;
  }

  function getTotalSale() {
    var totalSale = 0;
    items.forEach(function (item) {
      totalSale += item.sale * item.qty;
    });
    return totalSale;
  }

  function getTotalQty() {
    var totalQty = 0;
    items.forEach(function (item) {
      totalQty += item.qty;
    });
    return totalQty;
  }
  function getTotalCost() {
    var totalCost = 0;
    items.forEach(function (item) {
      totalCost += (item.qty * item.sale) - (item.qty * item.price);
    });
    return totalCost.toFixed(2);
  }

  // Function to update customer name
  $("#customer-name").on("input", function () {
    customerName = $(this).val();
  });
});