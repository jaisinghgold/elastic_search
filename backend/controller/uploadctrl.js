const csv = require("csv-parser");
const { Client } = require("elasticsearch");
const { Readable } = require("stream");

const client = new Client({ host: "localhost:9200" });

const uploadData = async (req, res) => {
  try {
    const indexName = req.file.originalname.split(".")[0];
    const docType = "_doc";
    const indexExists = await client.indices.exists({ index: indexName });

    if (!indexExists.body) {
      await client.indices.create({ index: indexName });
    }

    const bufferStream = new Readable.from(req.file.buffer);
    const results = [];

    bufferStream
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        const bulkBody = results.flatMap((data) => [
          { index: { _index: indexName, _type: docType } },
          data,
        ]);

        const bulkResponse = await client.bulk({
          refresh: true,
          body: bulkBody,
        });

        if (bulkResponse.errors) {
          // Handle bulk indexing errors
          const errorItems = bulkResponse.items.filter(
            (item) => item.index.error
          );
          const failedDocuments = errorItems.map((item) => item.index._id);
          console.error("Failed to index documents:", failedDocuments);
          res.status(500).json({ message: "Failed to upload data" });
          return;
        }

        const uploadedData = bulkResponse.items
          .filter((item) => !item.index.error)
          .map((item) => item.index._id);

        const body1 = await client.search({
          index: indexName,
          type: docType,
          body: { query: { match_all: {} }, size: 10000 },
        });

        const documents = body1.hits.hits.map((hit) => hit._source);

        res
          .status(200)
          .json({ message: "Data uploaded successfully", documents });
      });
  } catch (error) {
    // console.log(error);
    if (
      error &&
      error.body.error.type === "resource_already_exists_exception"
    ) {
      // console.error("Index already exists:", indexName);
      res.status(409).json({ message: "Index already exists" });
    } else {
      console.error("Failed to upload data:", error);
      res.status(500).json({ message: "Failed to upload data" });
    }
  }
};

const getDocuments = async (req, res) => {
  try {
    const body = await client.search({
      index: indexName,
      type: docType,
      body: {
        query: {
          match_all: {}, // Retrieve all documents
        },
        size: 10000,
      },
    });
    // console.log(body.hits);
    const documents = body.hits.hits.map((hit) => hit._source);

    res.status(200).json(documents);
  } catch (error) {
    console.error("Failed to retrieve documents:", error);
    res.status(500).json({ message: "Failed to retrieve documents" });
  }
};

// module.exports = { getDocuments };
module.exports = { uploadData, getDocuments };
