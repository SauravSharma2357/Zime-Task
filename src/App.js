import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table } from "antd";
import Highlighter from "react-highlight-words";

const App = () => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  function handleChange(pagination, filters, sorter) {
    console.log("pagination:", pagination);
    console.log("filters:", filters);
    console.log("sorter:", sorter);
    setPagination(pagination); // Update pagination state
  }

  const getData = async (page, pageSize) => {
    try {
      let response = await fetch(
        `https://dummyjson.com/posts?skip=${
          (page - 1) * pageSize
        }&limit=${pageSize}`
      );
      let { posts } = await response.json();
      return posts;
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    async function tabularData() {
      try {
        let data = await getData(pagination.current, pagination.pageSize);
        const transformRows = data.map(({ id, title, body, tags }) => ({
          key: `${id}`,
          title: `${title}`,
          body: `${body}`,
          tags: `${tags}`,
        }));

        setRows(transformRows);
        setPagination((prevState) => ({
          ...prevState,
          total: data.length,
        }));
      } catch (err) {
        console.log(err);
      }
    }
    tabularData();
  }, [pagination]);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });
  const columns = [
    {
      title: "ID",
      dataIndex: "key",
      key: "key",
      width: "30%",
      ...getColumnSearchProps("key"),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: "20%",
      ...getColumnSearchProps("title"),
    },
    {
      title: "Body",
      dataIndex: "body",
      key: "body",
      ...getColumnSearchProps("body"),
      sorter: (a, b) => a.body.length - b.body.length,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: "20%",
      ...getColumnSearchProps("tags"),
    },
  ];
  return (
    <Table
      columns={columns}
      dataSource={rows}
      pagination={pagination}
      onChange={handleChange}
    />
  );
};
export default App;
