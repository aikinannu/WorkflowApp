import { SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { social } from "../api/apiClient";
import AppHeader from "../components/AppHeader";

const jobTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];

export default function PostJobScreen({ navigation }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [jobType, setJobType] = useState(jobTypes[0]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreateJob = async () => {
    if (!user?.tenant_id) {
      alert("Unable to create job post: missing tenant context.");
      return;
    }
    if (!title.trim()) {
      alert("Please include a job title.");
      return;
    }

    setSubmitting(true);
    try {
      const content = `Job Opening: ${title.trim()}\nCompany: ${company.trim() || "Unknown"}\nLocation: ${location.trim() || "Remote"}\nType: ${jobType}\nSalary: ${salary.trim() || "Competitive"}\n\n${description.trim() || "No additional details provided."}`;
      await social.createPost({
        content,
        tenant_id: user.tenant_id,
      });
      alert("Job post published successfully.");
      navigation.goBack();
    } catch (error) {
      console.warn(error);
      alert(error.message || "Unable to publish job post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Post Job" leftIcon="arrow-back" onLeftPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.label}>Job title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Social media manager" />

          <Text style={styles.label}>Company</Text>
          <TextInput style={styles.input} value={company} onChangeText={setCompany} placeholder="Godemar's Empire" />

          <Text style={styles.label}>Location</Text>
          <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Remote / City" />

          <Text style={styles.label}>Salary</Text>
          <TextInput style={styles.input} value={salary} onChangeText={setSalary} placeholder="$45k - $55k" />

          <Text style={styles.label}>Job type</Text>
          <View style={styles.jobTypeRow}>
            {jobTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.jobTypeItem, jobType === type ? styles.jobTypeItemActive : null]}
                onPress={() => setJobType(type)}
              >
                <Text style={[styles.jobTypeText, jobType === type ? styles.jobTypeTextActive : null]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe responsibilities and qualifications..."
            multiline
          />

          <TouchableOpacity
            style={[styles.submitButton, submitting ? styles.disabledButton : null]}
            onPress={handleCreateJob}
            disabled={submitting}
          >
            <Ionicons name="briefcase-outline" size={18} color="#fff" />
            <Text style={styles.submitButtonText}>{submitting ? "Posting..." : "Post job"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 40 },
  formCard: { backgroundColor: "#f9fbff", borderRadius: 22, padding: 18, borderWidth: 1, borderColor: "#e8edf5" },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 8, color: "#1f2937" },
  input: { borderWidth: 1, borderColor: "#d1d9e6", backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 16, color: "#111" },
  textArea: { minHeight: 140, textAlignVertical: "top" },
  jobTypeRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  jobTypeItem: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: "#eef3fb", marginRight: 10, marginBottom: 10 },
  jobTypeItemActive: { backgroundColor: "#1DA1F2" },
  jobTypeText: { color: "#334155" },
  jobTypeTextActive: { color: "#fff" },
  submitButton: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, backgroundColor: "#1DA1F2", paddingVertical: 16, borderRadius: 16 },
  disabledButton: { opacity: 0.65 },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});