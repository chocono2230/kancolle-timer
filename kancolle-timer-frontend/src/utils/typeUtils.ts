// 引数xはK[]のプロパティを持っているオブジェクトであることを示す関数
// 持っていることを示せるが、それはunknown型
// 型ガード関数の中で用いると便利
// 例：
// const isDispContent = (content: unknown): content is DispContentType => {
//   if (
//     hasProperty(content, 'contentId', 'title', 'dialogFlag', 'dispContentItems')
//   ) {
//     if (
//       typeof content.contentId === 'string' &&
//       typeof content.title === 'string' &&
//       typeof content.dialogFlag === 'boolean'
//     ) {
//       if (content.dispContentItems instanceof Array) {
//         return (
//           content.dispContentItems.length === 0 ||
//           content.dispContentItems.every(e => typeof e === 'string')
//         );
//       }
//     }
//   }
//   return false;
// };
export function hasProperty<K extends string>(x: unknown, ...name: K[]): x is { [M in K]: unknown } {
  return x instanceof Object && name.every((prop) => prop in x);
}

// 非同期関数のReturnType時にPromiseの中身を抽出する。
// 例:
// type ContentItemsType = PromiseType<
//   ReturnType<typeof ContentItemService.listContentItemsByContentId>
// >;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PromiseType<T extends Promise<any>> = T extends Promise<infer P> ? P : never;

// Tips
// 配列型から要素の型を取り出す方法。 indexed access operator([number]が肝)
// type ContentItem = ContentItemArrayType[number]
// 配列からundefinedを削除しつつ、それを型に教える方法
// キーワード：Exclude、型ガード
// 例：
// array.filter((item): item is Exclude<typeof item, undefined> => item !== undefined)
// undefine/nullを許容しない型に変換
// type S = NonNullable<T> // Tはundefined/null許容。Sはundefined/null非許容
// 以下,調査中含む
// ジェネリクス型Tから、特定のプロパティ下(xxx)に存在する型を取り出す
// コピペしてxxxを書き換えて使用する(コピペせず用いる形があるかは調査中)
// キーワード：infer
// 例：
// type TT<T> = T extends { getTestItem?: infer R } ? R : never;
// type TestItem = TT<GetTestItemQuery>;
// これを入れ子にすることで、複数階層下の型を取り出せる（マシな方法があるかも）
// 例：userContentItems?.items?.以下を取り出す
// type TT3<T> = T extends { userContentItems?: infer R }
//   ? R extends { items?: infer R2 }
//     ? R2
//     : never
//   : never;
