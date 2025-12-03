import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { db } from "../../src/services/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function AdminShippingZones() {
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [zip1, setZip1] = useState("");
  const [zip2, setZip2] = useState("");
  const [standard, setStandard] = useState("");
  const [express, setExpress] = useState("");
  const [nextDay, setNextDay] = useState("");

  async function save() {
    await addDoc(collection(db, "shippingZones"), {
      country,
      region,
      zipRange: [Number(zip1), Number(zip2)],
      rates: {
        STANDARD: Number(standard),
        EXPRESS: Number(express),
        NEXT_DAY: Number(nextDay),
      },
    });

    alert("Zone added!");
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Add Shipping Zone</Text>

      <TextInput placeholder="Country" value={country} onChangeText={setCountry} />
      <TextInput placeholder="Region" value={region} onChangeText={setRegion} />
      <TextInput placeholder="Zip From" value={zip1} onChangeText={setZip1} />
      <TextInput placeholder="Zip To" value={zip2} onChangeText={setZip2} />

      <TextInput placeholder="Standard $" value={standard} onChangeText={setStandard} />
      <TextInput placeholder="Express $" value={express} onChangeText={setExpress} />
      <TextInput placeholder="Next Day $" value={nextDay} onChangeText={setNextDay} />

      <Button title="Save Zone" onPress={save} />
    </View>
  );
}
