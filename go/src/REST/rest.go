package main

//https://stackoverflow.com/questions/21220077/what-does-an-underscore-in-front-of-an-import-statement-mean

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux" //package is like express in node.js, didn't have enough time to mail.
	_ "github.com/mattn/go-sqlite3"
	"log" //package used for logging
	"net/http"
)

var database *sql.DB

/*	https://stackoverflow.com/questions/26327391/json-marshalstruct-returns
//	https://stackoverflow.com/questions/11693865/lowercase-json-key-names-with-json-marshal-in-go
//	https://thenewstack.io/understanding-golang-type-system/
//	https://stackoverflow.com/questions/21151765/cannot-unmarshal-string-into-go-value-of-type-int64
 	Object that represents the product in the store */
type Product struct {
	ID         int    `json:"id,string,omitempty"`
	Brand      string `json:"brand"`
	Model      string `json:"model"`
	Os         string `json:"os"`
	Image      string `json:"image"`
	Screensize int    `json:"screensize,string"`
}

//https://stackoverflow.com/questions/38449863/how-to-add-a-struct-to-an-array-of-structs-in-go
// Array(slice) of Product objects to send as JSON
type Products []Product

//http://go-database-sql.org/retrieving.html
// Retrieves the data from the database
func retrieveData(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r)

	var rows *sql.Rows
	var err error

	//check if GET wants specific product
	if params["id"] == "" {
		rows, err = database.Query("SELECT * FROM products")
	} else {
		rows, err = database.Query("SELECT * FROM products WHERE id = ?", params["id"])
	}

	if err != nil {
		log.Print(err)
		return
	}
	defer rows.Close()

	//Make a new product object with the data and put it into the array
	var products Products
	for rows.Next() {
		var product Product
		err := rows.Scan(&product.ID, &product.Brand, &product.Model, &product.Os, &product.Image, &product.Screensize)
		if err != nil {
			log.Print(err)
			return
		}
		products = append(products, product)
	}

	//https://blog.golang.org/json-and-go
	pjson, err := json.Marshal(products)

	err = rows.Err()
	if err != nil {
		log.Print(err)
		return
	}

	if len(products) == 0 && params["id"] != "" {
		w.WriteHeader(http.StatusNotFound)
	} else if len(products) == 0 {
		w.WriteHeader(http.StatusOK)
	} else {
		w.Write(pjson)
	}

}

//http://go-database-sql.org/modifying.html
//https://stackoverflow.com/questions/15672556/handling-json-post-request-in-go
// Adds data to the database
func addData(w http.ResponseWriter, r *http.Request) {
	var product Product

	d := json.NewDecoder(r.Body)
	err := d.Decode(&product)

	stmt, err := database.Prepare("INSERT INTO products(brand, model, os, image, screensize) VALUES(?,?,?,?,?)")

	//https: //blog.golang.org/error-handling-and-go
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Print(err)
		return
	}
	res, err := stmt.Exec(product.Brand, product.Model, product.Os, product.Image, product.Screensize)
	if err != nil {
		http.Error(w, err.Error(), 400)
		log.Print(err)
		return
	}
	lastID, err := res.LastInsertId()
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Print(err)
		return
	}
	rowCount, err := res.RowsAffected()

	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Print(err)
		return
	}

	log.Printf("ID = %d, affected = %d\n", lastID, rowCount)

	if rowCount == 0 {
		w.WriteHeader(http.StatusBadRequest)
	} else {
		w.WriteHeader(http.StatusCreated)
	}

}

// Updates a specific product
func updateData(w http.ResponseWriter, r *http.Request) {
	var product Product

	d := json.NewDecoder(r.Body)
	err := d.Decode(&product)

	stmt, err := database.Prepare("UPDATE products SET brand = ?, model = ?, os = ?, image = ?, screensize = ? WHERE id = ?")
	//https://stackoverflow.com/questions/18963984/exit-with-error-code-in-go
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Print(err)
		return
	}
	res, err := stmt.Exec(product.Brand, product.Model, product.Os, product.Image, product.Screensize, product.ID)
	if err != nil {
		log.Print(err)
		return
	}

	rowCount, err := res.RowsAffected()
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Print(err)
		return
	}

	log.Printf("ID = %d, affected = %d\n", product.ID, rowCount)

	if rowCount == 0 {
		w.WriteHeader(http.StatusNotFound)
	} else {
		w.WriteHeader(http.StatusNoContent)
	}

}

// Deletes a specific product
func deleteData(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	stmt, err := database.Prepare("DELETE FROM products WHERE id = ?")
	if err != nil {
		log.Print(err)
		return
	}
	res, err := stmt.Exec(params["id"])
	if err != nil {
		log.Print(err)
		return
	}

	rowCount, err := res.RowsAffected()
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Print(err)
		return
	}

	log.Printf("ID = %s, affected = %d\n", params["id"], rowCount)

	if rowCount == 0 {
		w.WriteHeader(http.StatusNotFound)
	} else {
		w.WriteHeader(http.StatusNoContent)
	}

}

// Resets the whole database
func deleteAllData(w http.ResponseWriter, r *http.Request) {

	stmt, err := database.Prepare("DELETE FROM products")
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Print(err)
		return
	}

	res, err := stmt.Exec()
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Print(err)
		return
	}
	rowCount, err := res.RowsAffected()
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Print(err)
		return
	}

	log.Printf("affected = %d\n", rowCount)
	w.WriteHeader(http.StatusNoContent)

}

func main() {

	database, _ = sql.Open("sqlite3", "testo.db")
	fmt.Printf("Database connection made")

	//https://www.alexedwards.net/blog/serving-static-sites-with-go
	//https://stackoverflow.com/questions/28793619/golang-what-to-use-http-servefile-or-http-fileserver
	//https://stackoverflow.com/questions/26559557/how-do-you-serve-a-static-html-file-using-a-go-web-server

	//https://stackoverflow.com/questions/21957455/difference-between-http-handle-and-http-handlefunc
	router := mux.NewRouter()

	router.HandleFunc("/api/products", retrieveData).Methods("GET")
	router.HandleFunc("/api/products/{id}", retrieveData).Methods("GET")

	router.HandleFunc("/api/products", addData).Methods("POST")

	router.HandleFunc("/api/products/{id}", updateData).Methods("PUT")

	router.HandleFunc("/api/products/reset", deleteAllData).Methods("DELETE")
	router.HandleFunc("/api/products/{id}", deleteData).Methods("DELETE")

	router.PathPrefix("/").Handler(http.FileServer(http.Dir("public")))

	http.ListenAndServe(":8080", router)

}
