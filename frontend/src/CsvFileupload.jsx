import React, { useCallback, useState } from "react";
import {
  EuiBasicTable,
  EuiSpacer,
  EuiHorizontalRule,
  EuiText,
  EuiFilePicker,
  EuiButton,
} from "@elastic/eui";

import axios from "axios";

const columns = [
  { field: "First Name", name: "First Name" },
  { field: "Last Name", name: "Last Name" },
  { field: "Github", name: "Github" },
  { field: "Date of Birth", name: "Date of Birth" },
  { field: "Location", name: "Location" },
  { field: "Online", name: "Online" },
];

const CsvFileupload = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const [tableData, setTableData] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const onTableChange = ({ page }) => {
    if (page) {
      const { index: pageIndex, size: pageSize } = page;
      setPageIndex(pageIndex);
      setPageSize(pageSize);
    }
  };

  const handleFileChange = useCallback((files) => {
    if (files[0]) {
      setSelectedFile(files[0]);
    }
  }, []);
  const handleFileUpload = useCallback(async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append("csvFile", selectedFile);
      try {
        const response = await axios.post(
          "http://localhost:5000/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response) {
          setTableData(response?.data?.documents);
        }
        console.log("File uploaded:", response.data.documents);
        // Perform further processing or handle the response as needed
      } catch (error) {
        console.error("Failed to upload file:", error?.response?.data?.message);
      }
    } else {
      console.log("No file selected");
    }
  }, [selectedFile, setTableData]);
  const findUsers = (tableData, pageIndex, pageSize) => {
    let pageOfItems;

    if (!pageIndex && !pageSize) {
      pageOfItems = tableData;
    } else {
      const startIndex = pageIndex * pageSize;
      pageOfItems = tableData.slice(
        startIndex,
        Math.min(startIndex + pageSize, tableData.length)
      );
    }

    return {
      pageOfItems,
      totalItemCount: tableData.length,
    };
  };
  const { pageOfItems, totalItemCount } = findUsers(
    tableData,
    pageIndex,
    pageSize
  );

  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount,
    pageSizeOptions: [10, 0],
  };
  const resultsCount =
    pageSize === 0 ? (
      <strong>All</strong>
    ) : (
      <>
        <strong>
          {pageSize * pageIndex + 1}-{pageSize * pageIndex + pageSize}
        </strong>{" "}
        of {totalItemCount}
      </>
    );
  return (
    <div style={{ display: "flex", justifyContent: "space-evenly" }}>
      <div>
        <EuiFilePicker
          id="filePicker"
          initialPromptText="Select or drag and drop a file"
          onChange={handleFileChange}
        />
        <EuiButton onClick={handleFileUpload}>Upload</EuiButton>
      </div>
      <div>
        <EuiSpacer size="xl" />
        <EuiText size="xs">
          Showing {resultsCount} <strong>Users</strong>
        </EuiText>
        <EuiSpacer size="s" />
        <EuiHorizontalRule margin="none" style={{ height: 2 }} />
        <EuiBasicTable
          tableCaption="Demo for EuiBasicTable with pagination"
          items={pageOfItems}
          columns={columns}
          pagination={pagination}
          onChange={onTableChange}
        />
      </div>
    </div>
  );
};
export default CsvFileupload;
