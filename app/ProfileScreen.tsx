import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, updatePassword } from "firebase/auth";
import { db } from "../app/firebase/firebaseConfig";

export default function ProfileScreen() {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    avatarUrl: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setForm({
          name: snap.data().name || "",
          email: user.email || "",
          phone: snap.data().phone || "",
          avatarUrl: snap.data().avatarUrl || "",
        });
      }
    } catch (err) {
      console.log("Load user error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!user) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập");
        return;
      }

      setSaving(true);

      /* ===== ĐỔI MẬT KHẨU (NẾU CÓ NHẬP) ===== */
      if (newPassword || confirmPassword) {
        if (newPassword.length < 6) {
          Alert.alert("Lỗi", "Mật khẩu phải ít nhất 6 ký tự");
          setSaving(false);
          return;
        }

        if (newPassword !== confirmPassword) {
          Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
          setSaving(false);
          return;
        }

        await updatePassword(user, newPassword);
      }

      /* ===== CẬP NHẬT FIRESTORE ===== */
      await updateDoc(doc(db, "users", user.uid), {
        name: form.name,
        phone: form.phone,
        avatarUrl: form.avatarUrl,
        updatedAt: new Date(),
      });

      Alert.alert("Thành công", "Cập nhật thông tin thành công");
      router.back();
    } catch (err: any) {
      console.log(err);

      if (err.code === "auth/requires-recent-login") {
        Alert.alert(
          "Bảo mật",
          "Vui lòng đăng nhập lại để đổi mật khẩu"
        );
      } else {
        Alert.alert("Lỗi", "Không thể cập nhật thông tin");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.card}>
          <Image
            source={{
            //   uri: form.avatarUrl || "https://i.pravatar.cc/150",
            }}
            style={styles.avatar}
          />

          <TextInput
            placeholder="Họ tên"
            style={styles.input}
            value={form.name}
            onChangeText={(t) => setForm({ ...form, name: t })}
          />

          <TextInput
            placeholder="Email"
            style={[styles.input, styles.disabledInput]}
            value={form.email}
            editable={false}
          />

          <TextInput
            placeholder="Số điện thoại"
            style={styles.input}
            value={form.phone}
            keyboardType="phone-pad"
            onChangeText={(t) => setForm({ ...form, phone: t })}
          />

          {/* ===== ĐỔI MẬT KHẨU ===== */}
          <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>

          <TextInput
            placeholder="Mật khẩu mới"
            style={styles.input}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <TextInput
            placeholder="Xác nhận mật khẩu mới"
            style={styles.input}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveText}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 40,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  card: {
    margin: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 20,
    backgroundColor: "#f1f5f9",
  },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: "#ffffff",
  },

  disabledInput: {
    backgroundColor: "#f1f5f9",
    color: "#64748b",
  },

  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },

  saveBtn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 12,
  },

  saveText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
  },
});
