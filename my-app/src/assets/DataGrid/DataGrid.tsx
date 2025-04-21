import * as React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableCellLayout,
  Avatar,
  Button,
  Input,
  useArrowNavigationGroup,
  useFocusableGroup,
} from '@fluentui/react-components';
import {
  DocumentRegular,
  EditRegular,
  FolderRegular,
  DeleteRegular,
  SaveRegular,
  VideoRegular,
  DocumentPdfRegular,
  ImageRegular,
} from '@fluentui/react-icons';
import type { PresenceBadgeStatus } from '@fluentui/react-components';
import { db } from '../../Service/firebaseConfig';
import { ref, set, remove, onValue } from 'firebase/database';
import './DataGrid.css';

interface FirebaseItem {
  file: string;
  author: string;
  lastUpdated: string;
  lastUpdate: string;
}

const initialItems = [
  {
    file: { label: 'Meeting notes', icon: <DocumentRegular /> },
    author: { label: 'Max Mustermann', status: 'available' },
    lastUpdated: { label: '7h ago', timestamp: 1 },
    lastUpdate: { label: 'You edited this', icon: <EditRegular /> },
  },
  {
    file: { label: 'Thursday presentation', icon: <FolderRegular /> },
    author: { label: 'Erika Mustermann', status: 'busy' },
    lastUpdated: { label: 'Yesterday at 1:45 PM', timestamp: 2 },
    lastUpdate: { label: 'You edited this', icon: <EditRegular /> },
  },
  {
    file: { label: 'Training recording', icon: <VideoRegular /> },
    author: { label: 'John Doe', status: 'away' },
    lastUpdated: { label: 'Yesterday at 1:45 PM', timestamp: 2 },
    lastUpdate: { label: 'You edited this', icon: <EditRegular /> },
  },
  {
    file: { label: 'Purchase order', icon: <DocumentPdfRegular /> },
    author: { label: 'Jane Doe', status: 'offline' },
    lastUpdated: { label: 'Tue at 9:30 AM', timestamp: 3 },
    lastUpdate: { label: 'You edited this', icon: <EditRegular /> },
  },
];

const columns = [
  { columnKey: 'file', label: 'File' },
  { columnKey: 'author', label: 'Author' },
  { columnKey: 'lastUpdated', label: 'Last updated' },
  { columnKey: 'lastUpdate', label: 'Last update' },
];

export const FocusableElementsInCells = () => {
  const keyboardNavAttr = useArrowNavigationGroup({ axis: 'grid' });
  const focusableGroupAttr = useFocusableGroup({
    tabBehavior: 'limited-trap-focus',
  });

  React.useEffect(() => {
    const itemsRef = ref(db, 'items');
    onValue(itemsRef, snapshot => {
      const data = snapshot.val() as Record<string, FirebaseItem> | null;
      if (!data) return;

      const loadedItems = Object.values(data).map(item => ({
        file: { label: item.file, icon: getFileIcon(item.file) },
        author: { label: item.author, status: 'available' },
        lastUpdated: { label: item.lastUpdated, timestamp: Date.now() },
        lastUpdate: { label: item.lastUpdate, icon: <EditRegular /> },
      }));
      setItems(loadedItems);
    });
  }, []);

  const [items, setItems] = React.useState(initialItems);
  const [editIndex, setEditIndex] = React.useState<number | null>(null);
  const [editData, setEditData] = React.useState({
    file: '',
    fileIcon: <DocumentRegular />,
    author: '',
    lastUpdated: '',
    lastUpdate: '',
  });

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return <DocumentPdfRegular />;
      case 'mp4':
      case 'mov':
        return <VideoRegular />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <ImageRegular />;
      case 'ppt':
      case 'pptx':
        return <FolderRegular />;
      default:
        return <DocumentRegular />;
    }
  };

  const handleAddRow = () => {
    setItems(prev => [
      ...prev,
      {
        file: { label: '', icon: <DocumentRegular /> },
        author: { label: '', status: 'available' },
        lastUpdated: { label: '', timestamp: Date.now() },
        lastUpdate: { label: '', icon: <EditRegular /> },
      },
    ]);
  };

  const handleDelete = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
    remove(ref(db, `items/${index}`));
  };

  const handleEdit = (index: number) => {
    const item = items[index];
    setEditIndex(index);
    setEditData({
      file: item.file.label,
      fileIcon: item.file.icon,
      author: item.author.label,
      lastUpdated: item.lastUpdated.label,
      lastUpdate: item.lastUpdate.label,
    });
  };

  const handleSave = async () => {
    if (editIndex === null) return;
    const updatedItems = [...items];
    updatedItems[editIndex] = {
      ...updatedItems[editIndex],
      file: {
        ...updatedItems[editIndex].file,
        label: editData.file,
      },
      author: { ...updatedItems[editIndex].author, label: editData.author },
      lastUpdated: {
        label: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        timestamp: Date.now(),
      },
      lastUpdate: {
        label: 'You edited this',
        icon: <EditRegular />,
      },
    };
    setItems(updatedItems);

    const updatedItem = updatedItems[editIndex];
    await set(ref(db, `items/${editIndex}`), {
      file: updatedItem.file.label,
      author: updatedItem.author.label,
      lastUpdated: updatedItem.lastUpdated.label,
      lastUpdate: updatedItem.lastUpdate.label,
    });

    setEditIndex(null);
  };

  return (
    <div>
      <div className="form-wrapper">
        <form className="form-table">
          <Table
            {...keyboardNavAttr}
            role="grid"
            aria-label="Table with grid keyboard navigation"
            style={{ minWidth: '620px' }}
          >
            <TableHeader>
              <TableRow>
                {columns.map(column => (
                  <TableHeaderCell key={column.columnKey}>
                    {column.label}
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const isEditing = index === editIndex;

                return (
                  <TableRow key={index}>
                    <TableCell tabIndex={0} role="gridcell">
                      <TableCellLayout media={item.file.icon}>
                        {isEditing ? (
                          <input
                            type="file"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const icon = getFileIcon(file.name); // 👉 выбираем иконку

                                setItems(prev => {
                                  const updated = [...prev];
                                  updated[index] = {
                                    ...updated[index],
                                    file: {
                                      label: file.name,
                                      icon: icon,
                                    },
                                  };
                                  return updated;
                                });

                                if (editIndex === index) {
                                  setEditData(prev => ({
                                    ...prev,
                                    file: file.name,
                                  }));
                                }
                              }
                            }}
                          />
                        ) : editIndex === index && editData.file ? (
                          editData.file
                        ) : (
                          item.file.label || <em>Attach file</em>
                        )}
                      </TableCellLayout>
                    </TableCell>
                    <TableCell tabIndex={0} role="gridcell">
                      <TableCellLayout
                        media={
                          <Avatar
                            aria-label={item.author.label}
                            name={item.author.label}
                            badge={{
                              status: item.author.status as PresenceBadgeStatus,
                            }}
                          />
                        }
                      >
                        {isEditing ? (
                          <Input
                            value={editData.author}
                            onChange={(_, data) =>
                              setEditData({ ...editData, author: data.value })
                            }
                          />
                        ) : (
                          item.author.label || <em>New Author</em>
                        )}
                      </TableCellLayout>
                    </TableCell>
                    <TableCell tabIndex={0} role="gridcell">
                      {isEditing ? (
                        <Input
                          value={editData.lastUpdated}
                          onChange={(_, data) =>
                            setEditData({
                              ...editData,
                              lastUpdated: data.value,
                            })
                          }
                        />
                      ) : (
                        item.lastUpdated.label || <em>Just now</em>
                      )}
                    </TableCell>
                    <TableCell tabIndex={0} role="gridcell">
                      <TableCellLayout media={item.lastUpdate.icon}>
                        {isEditing ? (
                          <Input
                            onChange={() =>
                              setEditData({
                                ...editData,
                              })
                            }
                          />
                        ) : (
                          item.lastUpdate.label || <em>New update</em>
                        )}
                      </TableCellLayout>
                    </TableCell>
                    <TableCell
                      role="gridcell"
                      tabIndex={0}
                      {...focusableGroupAttr}
                    >
                      <TableCellLayout>
                        {isEditing ? (
                          <Button
                            icon={<SaveRegular />}
                            aria-label="Save"
                            onClick={handleSave}
                          />
                        ) : (
                          <Button
                            icon={<EditRegular />}
                            aria-label="Edit"
                            onClick={() => handleEdit(index)}
                          />
                        )}
                        <Button
                          icon={<DeleteRegular />}
                          aria-label="Delete"
                          onClick={() => handleDelete(index)}
                        />
                      </TableCellLayout>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Button onClick={handleAddRow}>+ Add Row</Button>
        </form>
      </div>
    </div>
  );
};
