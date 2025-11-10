import Todo from "../models/Todo.js";


export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ userID: req.user.userId }); // Sử dụng userId từ token
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy todo" });
  }
};


export const createTodo = async (req, res) => {
  try {
    const todo = new Todo({
      title: req.body.title,
      userID: req.user.userId,
      completed: req.body.completed || false,
    });
    await todo.save();
    res.status(201).json({ message: "Tạo todo thành công", todo });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi tạo todo" });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userID: req.user.userId },
      { $set: req.body },
      { new: true }
    );

    if (!todo) {
      return res.status(404).json({ message: "Không tìm thấy todo" });
    }

    res.status(200).json({ message: "Cập nhật thành công", todo });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi cập nhật todo" });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      userID: req.user.userId,
    });

    if (!todo) {
      return res.status(404).json({ message: "Không tìm thấy todo" });
    }

    res.status(200).json({ message: "Xóa todo thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi xóa todo" });
  }
};
