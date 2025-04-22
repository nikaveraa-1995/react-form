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
import { v4 as uuidv4 } from 'uuid';
import './DataGrid.css';

interface FirebaseItem {
  id: string;
  file: string;
  author: string;
  lastUpdated: string;
  lastUpdate: string;
  lastActive: number;
}
interface initialItems {
  id: string; // добавляем id
  file: {
    label: string;
    icon: JSX.Element;
  };
  author: {
    label: string;
    status: string;
  };
  lastUpdated: {
    label: string;
    timestamp: number;
  };
  lastUpdate: {
    label: string;
    icon: JSX.Element;
  };
}
const initialItems = [
  {
    id: '1',
    file: { label: 'Meeting notes', icon: <DocumentRegular /> },
    author: { label: 'Max Mustermann', status: 'available' },
    lastUpdated: { label: '7h ago', timestamp: 1 },
    lastUpdate: { label: 'You edited this', icon: <EditRegular /> },
  },
  {
    id: '2',
    file: { label: 'Thursday presentation', icon: <FolderRegular /> },
    author: { label: 'Erika Mustermann', status: 'busy' },
    lastUpdated: { label: 'Yesterday at 1:45 PM', timestamp: 2 },
    lastUpdate: { label: 'You edited this', icon: <EditRegular /> },
  },
  {
    id: '3',
    file: { label: 'Training recording', icon: <VideoRegular /> },
    author: { label: 'John Doe', status: 'away' },
    lastUpdated: { label: 'Yesterday at 1:45 PM', timestamp: 2 },
    lastUpdate: { label: 'You edited this', icon: <EditRegular /> },
  },
  {
    id: '4',
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

    // Обработчик данных из Firebase
    onValue(itemsRef, snapshot => {
      const data = snapshot.val() as Record<string, FirebaseItem> | null;
      if (!data) return;

      // Преобразуем полученные данные
      const loadedItems = Object.keys(data).map(key => {
        const item = data[key];
        return {
          id: key, // добавляем id
          file: { label: item.file, icon: getFileIcon(item.file) }, // иконка для файла
          author: { label: item.author, status: 'available' },
          lastUpdated: { label: item.lastUpdated, timestamp: Date.now() },
          lastUpdate: { label: item.lastUpdate, icon: <EditRegular /> },
          lastActive: item.lastActive || Date.now(), // Добавляем последнее время активности
        };
      });

      console.log('Loaded items with lastActive:', loadedItems);

      // Обновляем состояние с новыми данными
      setItems(prevItems => {
        // Создаем новый массив с обновленными данными
        const updatedItems = prevItems.map(prevItem => {
          // Ищем соответствующий элемент в loadedItems
          const loadedItem = loadedItems.find(item => item.id === prevItem.id);

          if (loadedItem) {
            // Если элемент найден, обновляем его
            return {
              ...loadedItem,
              author: {
                ...loadedItem.author,
                status: getStatus(loadedItem.lastActive), // Обновляем статус по времени последней активности
              },
            };
          }

          // Если элемент не найден, возвращаем его без изменений
          return prevItem;
        });

        // Добавляем новые элементы, которых не было в prevItems
        loadedItems.forEach(loadedItem => {
          const isItemExist = prevItems.some(item => item.id === loadedItem.id);
          if (!isItemExist) {
            updatedItems.push({
              ...loadedItem,
              author: {
                ...loadedItem.author,
                status: getStatus(loadedItem.lastActive), // Обновляем статус
              },
            });
          }
        });

        // Возвращаем обновленный массив
        return updatedItems;
      });
    });
  }, []);

  const [items, setItems] = React.useState<initialItems[]>(initialItems);
  const [editId, setEditId] = React.useState<string | null>(null);
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

  const getStatus = (lastActive: number) => {
    const now = Date.now();
    const diff = now - lastActive;

    if (diff < 10 * 60 * 1000) {
      // менее 10 минут
      return 'available';
    } else if (diff < 60 * 60 * 1000) {
      // менее 1 часа
      return 'busy';
    } else if (diff < 2 * 60 * 60 * 1000) {
      // менее 2 часов
      return 'away';
    } else {
      return 'offline';
    }
  };

  const handleAddRow = () => {
    setItems(prev => [
      ...prev,
      {
        id: uuidv4(),
        file: { label: '', icon: <DocumentRegular /> },
        author: { label: '', status: 'available' },
        lastUpdated: { label: '', timestamp: Date.now() },
        lastUpdate: { label: '', icon: <EditRegular /> },
        lastActive: Date.now(),
      },
    ]);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    remove(ref(db, `items/${id}`));
  };

  const handleEdit = (id: string) => {
    setEditId(id);
    const foundItem = items.find(item => item.id === id);
    if (foundItem) {
      setEditData({
        fileIcon: <DocumentRegular />,
        file: foundItem.file.label,
        author: foundItem.author.label,
        lastUpdated: foundItem.lastUpdated.label,
        lastUpdate: foundItem.lastUpdate.label,
      });
    }
  };

  const handleSave = async () => {
    if (!editId) return;

    const updatedItems = items.map(item => {
      if (item.id === editId) {
        return {
          ...item,
          file: {
            ...item.file,
            label: editData.file,
          },
          author: {
            ...item.author,
            label: editData.author,
          },
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
      }
      return item;
    });

    setItems(updatedItems);

    const updatedItem = updatedItems.find(item => item.id === editId);
    if (updatedItem) {
      await set(ref(db, `items/${editId}`), {
        file: updatedItem.file.label,
        author: updatedItem.author.label,
        lastUpdated: updatedItem.lastUpdated.label,
        lastUpdate: updatedItem.lastUpdate.label,
      });
    }

    setEditId(null);
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
              {items.map(item => {
                const isEditing = item.id === editId;

                return (
                  <TableRow key={item.id}>
                    <TableCell tabIndex={0} role="gridcell">
                      <TableCellLayout media={item.file.icon}>
                        {isEditing ? (
                          <input
                            type="file"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const icon = getFileIcon(file.name); // 👉 выбираем иконку

                                setItems(prev =>
                                  prev.map(el =>
                                    el.id === item.id
                                      ? {
                                          ...el,
                                          file: {
                                            label: file.name,
                                            icon: icon,
                                          },
                                        }
                                      : el,
                                  ),
                                );

                                if (editId === item.id) {
                                  setEditData(prev => ({
                                    ...prev,
                                    file: file.name,
                                  }));
                                }
                              }
                            }}
                          />
                        ) : editId === item.id && editData.file ? (
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
                            onClick={() => handleEdit(item.id)}
                          />
                        )}
                        <Button
                          icon={<DeleteRegular />}
                          aria-label="Delete"
                          onClick={() => handleDelete(item.id)}
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
