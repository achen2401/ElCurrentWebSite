<?php
    //open connection to mysql db
    //$connection = mysqli_connect("localhost","root","Bobofefe0127","eleanor") or die("Error " . mysqli_error($connection));
    //switch to eleanor2.ovid.u.washington.edu when switching to uw site
    //$connection = new MySQLi('localhost', 'root', 'root', 'eleanor', 2401);
    $connection = new MySQLi('eleanor2.ovid.u.washington.edu', 'bobo', 'eleanor2', 'eleanor', 2401);

    //fetch table rows from mysql db
    switch ($_GET["method"]) {
        case "labMembers":
            $sql = "select CASE WHEN title is null then name else concat(name, ', ', title) END as name, imgsrc from labMembers order by id desc";
            break;
        case "visitCount":
            $sql = "select count from visitCount where type = 'visit'";
            break;
        case "setCount":
            $sql = "update visitCount set count = " . $_GET["count"] . " Where type = 'visit';";
            mysqli_query($connection, $sql) or die("Error in Update " . mysqli_error($connection));
            $sql = " select count from visitCount where type= 'visit'";
    }

    $result = mysqli_query($connection, $sql) or die("Error in Selecting " . mysqli_error($connection));
    //echo $sql;


    //create an array
    //$emparray[] = array();
    //while($row =mysqli_fetch_assoc($result))
    //{
        //if ($row) $emparray[] = $row;
    //}
    //echo json_encode($emparray);

    //echo "Reverse order...\n";

    echo "[";
	for ($row_no = $result->num_rows - 1; $row_no >= 0; $row_no--) {
	    $result->data_seek($row_no);
	    $row = $result->fetch_assoc();
	    echo "{";
	    $last_key = end(array_keys($row));
	    foreach ($row as $key => $value){
	    	echo '"'.$key . '":"'. $row[$key] . '"';
	    	if ($key != $last_key) echo ",";
	    }
	    echo "}";
	    if ($row_no != 0) echo ",";

	}
	echo "]";



    //close the db connection
    mysqli_close($connection);
?>
